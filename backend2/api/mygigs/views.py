from django.shortcuts import get_object_or_404, render
from rest_framework import viewsets, status
from .serializers import FreelancerListSerializer, JobSerializer, ProfessionSerializer, ReviewSerializer, ReviewReplySerializer, TestimonialSerializer, FreelancerDetailSerializer, FreelancerSerializer
from rest_framework import filters
from rest_framework.response import Response
from rest_framework.views import APIView   
from .models import Freelancer, Job, Review, Testimonial, Profession, ReviewHelpful
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser  
from users.authentication import ClerkAuthentication  
from users.utils import get_or_create_freelancer

# Create your views here.
#
class ProfessionViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve professions"""
    queryset = Profession.objects.filter(is_active=True)
    serializer_class = ProfessionSerializer
    
    @action(detail=True, methods=['get'])
    def freelancers(self, request, pk=None):
        """Get all freelancers for a specific profession"""
        profession = self.get_object()
        freelancers = profession.freelancers.filter(is_active=True)
        
        # Apply filters
        county = request.query_params.get('county')
        constituency = request.query_params.get('constituency')
        ward = request.query_params.get('ward')
        min_rating = request.query_params.get('min_rating')
        min_experience = request.query_params.get('min_experience')
        search = request.query_params.get('search')
        
        if county:
            freelancers = freelancers.filter(county__iexact=county)
        if constituency:
            freelancers = freelancers.filter(constituency__iexact=constituency)
        if ward:
            freelancers = freelancers.filter(ward__iexact=ward)
        if min_rating:
            freelancers = freelancers.filter(rating__gte=float(min_rating))
        if min_experience:
            freelancers = freelancers.filter(years_experience__gte=int(min_experience))
        if search:
            freelancers = freelancers.filter(
                Q(name__icontains=search) | 
                Q(skills__icontains=search)
            )
        
        page = self.paginate_queryset(freelancers)
        serializer = FreelancerListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class FreelancerViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve freelancers"""
    queryset = Freelancer.objects.filter(is_active=True).select_related('profession')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FreelancerDetailSerializer
        return FreelancerListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filters
        profession = self.request.query_params.get('profession')
        county = self.request.query_params.get('county')
        constituency = self.request.query_params.get('constituency')
        ward = self.request.query_params.get('ward')
        min_rating = self.request.query_params.get('min_rating')
        min_experience = self.request.query_params.get('min_experience')
        search = self.request.query_params.get('search')
        
        if profession:
            queryset = queryset.filter(profession__id=profession)
        if county:
            queryset = queryset.filter(county__iexact=county)
        if constituency:
            queryset = queryset.filter(constituency__iexact=constituency)
        if ward:
            queryset = queryset.filter(ward__iexact=ward)
        if min_rating:
            queryset = queryset.filter(rating__gte=float(min_rating))
        if min_experience:
            queryset = queryset.filter(years_experience__gte=int(min_experience))
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(skills__icontains=search) |
                Q(profession__name__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured freelancers for homepage"""
        featured = self.get_queryset().filter(is_featured=True)[:8]
        serializer = FreelancerListSerializer(featured, many=True)
        return Response(serializer.data)


class FreelancerProfileUpdateView(APIView):
    authentication_classes = [ClerkAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        freelancer = get_or_create_freelancer(request.user)
        serializer = FreelancerSerializer(freelancer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        freelancer = get_or_create_freelancer(request.user)
        serializer = FreelancerSerializer(freelancer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



    serializer_class = ReviewSerializer
    authentication_classes = [ClerkAuthentication]

    def get_permissions(self):
        # Allow anyone to view reviews
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]

        # Only authenticated users can create reviews
        if self.action in ["create", "perform_create", "mark_helpful", "add_reply"]:
            return [IsAuthenticated()]

        return [AllowAny()]

    def get_queryset(self):
        freelancer_id = self.kwargs.get('freelancer_id')
        return Review.objects.filter(freelancer_id=freelancer_id).order_by('-created_at')

    def perform_create(self, serializer):
        print("Request data:", self.request.data)

        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required")

        freelancer_id = self.kwargs.get('freelancer_id')
        freelancer = get_object_or_404(Freelancer, id=freelancer_id)

        # Compute client name & avatar
        client_name = f"{user.first_name} {user.last_name}".strip() or user.username
        client_avatar = "".join([part[0].upper() for part in client_name.split()[:2]])

        serializer.save(
            freelancer=freelancer,
            client=user,
            client_name=client_name,
            client_avatar=client_avatar,
            helpful_count=0
        )

    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        review = self.get_object()
        review.helpful_count += 1
        review.save()
        return Response({'helpful_count': review.helpful_count})

    @action(detail=True, methods=['post'])
    def add_reply(self, request, pk=None):
        review = self.get_object()
        serializer = ReviewReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(review=review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    authentication_classes = [ClerkAuthentication]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        freelancer_id = (
            self.kwargs.get("freelancer_pk")
            or self.kwargs.get("freelancer_id")
        )

        if freelancer_id:
            return Review.objects.filter(
                freelancer_id=freelancer_id
            ).order_by("-created_at")

        return Review.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        freelancer_id = (
            self.kwargs.get("freelancer_pk")
            or self.kwargs.get("freelancer_id")
        )

        freelancer = get_object_or_404(Freelancer, id=freelancer_id)

        client_name = (
            f"{user.first_name} {user.last_name}".strip()
            or user.username
        )
        client_avatar = "".join(
            part[0].upper() for part in client_name.split()[:2]
        )

        serializer.save(
            freelancer=freelancer,
            client=user,
            client_name=client_name,
            client_avatar=client_avatar,
            helpful_count=0,
        )

    @action(detail=True, methods=["post"])
    def add_reply(self, request, pk=None):
        review = self.get_object()
        serializer = ReviewReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(review=review)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=["post"])
    def mark_helpful(self, request, pk=None):
        review = self.get_object()
        user = request.user

        helpful, created = ReviewHelpful.objects.get_or_create(
            review=review,
            user=user
        )

        if not created:
            return Response(
                {"detail": "You already marked this review as helpful."},
                status=status.HTTP_400_BAD_REQUEST
            )

        review.helpful_count += 1
        review.save(update_fields=["helpful_count"])

        return Response(
            {"helpful_count": review.helpful_count},
            status=status.HTTP_200_OK
        )

class TestimonialViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonialSerializer

    def get_queryset(self):
        # Public users only see approved testimonials
        if self.request.user.is_staff:
            return Testimonial.objects.all().order_by("-created_at")
        return Testimonial.objects.filter(is_approved=True).order_by("-created_at")

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        elif self.action == "create":
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    def perform_create(self, serializer):
        user = self.request.user

        name = f"{user.first_name} {user.last_name}".strip() or user.username
        avatar = "".join(part[0].upper() for part in name.split()[:2])

        serializer.save(
            name=name,
            avatar=avatar,
            is_approved=False  # always require moderation
        )


class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

@api_view(["GET"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def whoami(request):
    user = request.user
    return Response({
        "id": user.id,
        "email": user.email,
        "name": user.first_name,
        "clerk_id": user.username
    })