// ============================================
// API Configuration and Utility Functions
// ============================================
// This file contains all API endpoint configurations and fetch utilities
// for communicating with your Django REST Framework backend

// Base API URL - Update this to your Django backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ============================================
// Generic API Utility Functions
// ============================================

/**
 * Generic fetch wrapper with error handling
 * @param endpoint - API endpoint (e.g., '/freelancers/')
 * @param options - Fetch options (method, headers, body, etc.)
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If you need authentication, add token to headers:   3 lines uncommented
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

// ============================================
// DJANGO REST FRAMEWORK ENDPOINTS
// ============================================

// --------------------------------------------
// Freelancers API  uncommented
// --------------------------------------------
// Django Model: FreelancerProfile
// Django Serializer: FreelancerProfileSerializer
// Django ViewSet: FreelancerProfileViewSet
// URL Pattern: /api/freelancers/

export interface Freelancer {
  id: number;
  name: string;
  title: string;
  county: string;           // Foreign key to County model
  constituency: string;     // Foreign key to Constituency model
  ward: string;            // Foreign key to Ward model
  rating: number;
  reviews: number;
  completed_jobs: number;
  skills: string[];        // JSONField or ManyToMany relationship
  avatar: string;          // Could be avatar initials or image URL
  years_experience: number;
  hourly_rate: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Django Model Structure:
 * 
 * class Freelancer(models.Model):
 *     name = models.CharField(max_length=200)
 *     title = models.CharField(max_length=200)
 *     county = models.ForeignKey('County', on_delete=models.SET_NULL, null=True)
 *     constituency = models.ForeignKey('Constituency', on_delete=models.SET_NULL, null=True)
 *     ward = models.ForeignKey('Ward', on_delete=models.SET_NULL, null=True)
 *     rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
 *     reviews = models.IntegerField(default=0)
 *     completed_jobs = models.IntegerField(default=0)
 *     skills = models.JSONField(default=list)  # or ManyToManyField to Skill model
 *     avatar = models.CharField(max_length=10)  # or ImageField for actual images
 *     years_experience = models.IntegerField()
 *     hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
 *     is_featured = models.BooleanField(default=False)
 *     created_at = models.DateTimeField(auto_now_add=True)
 *     updated_at = models.DateTimeField(auto_now=True)
 * 
 * Django Serializer:
 * 
 * class FreelancerSerializer(serializers.ModelSerializer):
 *     county = serializers.StringRelatedField()
 *     constituency = serializers.StringRelatedField()
 *     ward = serializers.StringRelatedField()
 *     
 *     class Meta:
 *         model = Freelancer
 *         fields = '__all__'
 * 
 * Django ViewSet:
 * 
 * class FreelancerViewSet(viewsets.ModelViewSet):
 *     queryset = Freelancer.objects.all()
 *     serializer_class = FreelancerSerializer
 *     filter_backends = [filters.SearchFilter, filters.OrderingFilter]
 *     search_fields = ['name', 'title', 'skills']
 *     ordering_fields = ['rating', 'hourly_rate', 'created_at']
 *     
 *     def get_queryset(self):
 *         queryset = super().get_queryset()
 *         # Filter by location
 *         county = self.request.query_params.get('county')
 *         constituency = self.request.query_params.get('constituency')
 *         ward = self.request.query_params.get('ward')
 *         # Filter by profession
 *         profession = self.request.query_params.get('profession')
 *         # Filter by price range
 *         min_rate = self.request.query_params.get('min_rate')
 *         max_rate = self.request.query_params.get('max_rate')
 *         
 *         if county:
 *             queryset = queryset.filter(county__name=county)
 *         if constituency:
 *             queryset = queryset.filter(constituency__name=constituency)
 *         if ward:
 *             queryset = queryset.filter(ward__name=ward)
 *         if profession:
 *             queryset = queryset.filter(title__icontains=profession)
 *         if min_rate:
 *             queryset = queryset.filter(hourly_rate__gte=min_rate)
 *         if max_rate:
 *             queryset = queryset.filter(hourly_rate__lte=max_rate)
 *         
 *         return queryset
 * 
 * URLs Configuration (urls.py):
 * 
 * from rest_framework.routers import DefaultRouter
 * from .views import FreelancerViewSet
 * 
 * router = DefaultRouter()
 * router.register(r'freelancers', FreelancerViewSet, basename='freelancer')
 * 
 * urlpatterns = [
 *     path('api/', include(router.urls)),
 * ]
 */




// export async function fetchFreelancers(params: {
//   search?: string;
//   county?: string;
//   constituency?: string;
//   ward?: string;
//   profession?: string;
//   min_rate?: number;
//   max_rate?: number;
//   page?: number;
//   page_size?: number;
// }): Promise<{ results: Freelancer[]; count: number }> {
//   // Build query string
//   const queryParams = new URLSearchParams();
  
//   if (params.search) queryParams.append('search', params.search);
//   if (params.county) queryParams.append('county', params.county);
//   if (params.constituency) queryParams.append('constituency', params.constituency);
//   if (params.ward) queryParams.append('ward', params.ward);
//   if (params.profession) queryParams.append('profession', params.profession);
//   if (params.min_rate) queryParams.append('min_rate', params.min_rate.toString());
//   if (params.max_rate) queryParams.append('max_rate', params.max_rate.toString());
//   if (params.page) queryParams.append('page', params.page.toString());
//   if (params.page_size) queryParams.append('page_size', params.page_size.toString());

//   return apiFetch<{ results: Freelancer[]; count: number }>(
//     `/freelancers/?${queryParams.toString()}`
//   );
// } 

export const fetchFreelancersByProfession = async (
  professionId: number,
  filters: {
    county?: string;
    constituency?: string;
    ward?: string;
    min_rating?: number;
    min_experience?: number;
    search?: string;
    page?: number;
    page_size?: number;
  }
): Promise<{ results: Freelancer[]; count: number }> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetch(
    `${API_BASE_URL}/professions/${professionId}/freelancers/?${params}`
  );
  if (!response.ok) throw new Error('Failed to fetch freelancers');
  return response.json();
};

export async function fetchFeaturedFreelancers(): Promise<Freelancer[]> {
  // Django endpoint: /api/freelancers/?is_featured=true&page_size=4
  return apiFetch<Freelancer[]>('/freelancers/?is_featured=true&page_size=4');
}

export async function fetchFreelancerById(id: number): Promise<Freelancer> {
  // Django endpoint: /api/freelancers/{id}/
  return apiFetch<Freelancer>(`/freelancers/${id}/`);
}

// --------------------------------------------
// Professions/Categories API
// --------------------------------------------
// Django Model: Profession
// Django Serializer: ProfessionSerializer

export interface Profession {
  id: number;
  name: string;
  image_url: string;       // ImageField - Django will serve from MEDIA_URL
  count: number;           // Computed field - count of freelancers with this profession
  description: string;
}

/**
 * Django Model Structure:
 * 
 * class Profession(models.Model):
 *     name = models.CharField(max_length=100, unique=True)
 *     image = models.ImageField(upload_to='professions/')
 *     description = models.TextField()
 *     created_at = models.DateTimeField(auto_now_add=True)
 *     
 *     def get_freelancer_count(self):
 *         return self.freelancer_set.count()
 * 
 * Django Serializer:
 * 
 * class ProfessionSerializer(serializers.ModelSerializer):
 *     image_url = serializers.SerializerMethodField()
 *     count = serializers.SerializerMethodField()
 *     
 *     class Meta:
 *         model = Profession
 *         fields = ['id', 'name', 'image_url', 'count', 'description']
 *     
 *     def get_image_url(self, obj):
 *         request = self.context.get('request')
 *         if obj.image and hasattr(obj.image, 'url'):
 *             return request.build_absolute_uri(obj.image.url)
 *         return None
 *     
 *     def get_count(self, obj):
 *         return obj.get_freelancer_count()
 */

// export async function fetchProfessions(): Promise<Profession[]> {
//   // Django endpoint: /api/professions/
//   return apiFetch<Profession[]>('/professions/');
// }
export const fetchProfessions = async (): Promise<Profession[]> => {
  const response = await fetch(`${API_BASE_URL}/professions/`);
  if (!response.ok) throw new Error('Failed to fetch professions');
  return response.json();
};

// --------------------------------------------
// Reviews API
// --------------------------------------------
// Django Model: Review

export interface Review {
  id: string;
  freelancer_id: number;   // Foreign key to Freelancer
  client_name: string;
  client_avatar: string;
  rating: number;
  content: string;
  helpful_count: number;
  created_at: string;
  reply?: {
    content: string;
    created_at: string;
  };
}

/**
 * Django Model Structure:
 * 
 * class Review(models.Model):
 *     freelancer = models.ForeignKey('Freelancer', on_delete=models.CASCADE, related_name='reviews')
 *     client = models.ForeignKey(User, on_delete=models.CASCADE)
 *     client_name = models.CharField(max_length=200)
 *     client_avatar = models.CharField(max_length=10)
 *     rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
 *     content = models.TextField()
 *     helpful_count = models.IntegerField(default=0)
 *     created_at = models.DateTimeField(auto_now_add=True)
 * 
 * class ReviewReply(models.Model):
 *     review = models.OneToOneField('Review', on_delete=models.CASCADE, related_name='reply')
 *     content = models.TextField()
 *     created_at = models.DateTimeField(auto_now_add=True)
 * 
 * Django Serializer:
 * 
 * class ReviewReplySerializer(serializers.ModelSerializer):
 *     class Meta:
 *         model = ReviewReply
 *         fields = ['content', 'created_at']
 * 
 * class ReviewSerializer(serializers.ModelSerializer):
 *     reply = ReviewReplySerializer(read_only=True)
 *     
 *     class Meta:
 *         model = Review
 *         fields = '__all__'
 * 
 * Django ViewSet:
 * 
 * class ReviewViewSet(viewsets.ModelViewSet):
 *     serializer_class = ReviewSerializer
 *     
 *     def get_queryset(self):
 *         freelancer_id = self.kwargs.get('freelancer_id')
 *         return Review.objects.filter(freelancer_id=freelancer_id).order_by('-created_at')
 *     
 *     @action(detail=True, methods=['post'])
 *     def mark_helpful(self, request, pk=None):
 *         review = self.get_object()
 *         review.helpful_count += 1
 *         review.save()
 *         return Response({'helpful_count': review.helpful_count})
 *     
 *     @action(detail=True, methods=['post'])
 *     def add_reply(self, request, pk=None):
 *         review = self.get_object()
 *         serializer = ReviewReplySerializer(data=request.data)
 *         if serializer.is_valid():
 *             serializer.save(review=review)
 *             return Response(serializer.data)
 *         return Response(serializer.errors, status=400)
 * 
 * URLs (nested under freelancers):
 * 
 * router.register(
 *     r'freelancers/(?P<freelancer_id>\d+)/reviews',
 *     ReviewViewSet,
 *     basename='freelancer-review'
 * )
 */

export async function fetchReviewsByFreelancer(freelancerId: number): Promise<Review[]> {
  // Django endpoint: /api/freelancers/{freelancer_id}/reviews/
  return apiFetch<Review[]>(`/freelancers/${freelancerId}/reviews/`);
}

// export async function createReview(
//   freelancerId: number,
//   data: { rating: number; content: string }
// ): Promise<Review> {
//   // Django endpoint: POST /api/freelancers/{freelancer_id}/reviews/
//   return apiFetch<Review>(`/freelancers/${freelancerId}/reviews/`, {
//     method: 'POST',
//     body: JSON.stringify(data),
//   });
// }
export async function createReview(freelancerId: number, data: any, token?: string) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/freelancers/${freelancerId}/reviews/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    console.error("BACKEND ERROR:", errBody);
    throw new Error(errBody?.detail || "Failed to create review");
  }

  return res.json();
}

// export async function markReviewHelpful(freelancerId: number, reviewId: string): Promise<{ helpful_count: number }> {
//   // Django endpoint: POST /api/freelancers/{freelancer_id}/reviews/{review_id}/mark_helpful/
//   return apiFetch<{ helpful_count: number }>(
//     `/freelancers/${freelancerId}/reviews/${reviewId}/mark_helpful/`,
//     { method: 'POST' }
//   );
// }

// export async function addReviewReply(
//   freelancerId: number,
//   reviewId: string,
//   content: string
// ): Promise<{ content: string; created_at: string }> {
//   // Django endpoint: POST /api/freelancers/{freelancer_id}/reviews/{review_id}/add_reply/
//   return apiFetch<{ content: string; created_at: string }>(
//     `/freelancers/${freelancerId}/reviews/${reviewId}/add_reply/`,
//     {
//       method: 'POST',
//       body: JSON.stringify({ content }),
//     }
//   );
// }

// --------------------------------------------
// Jobs API
// --------------------------------------------
// Django Model: Job

// export async function addReviewReply(reviewId: string, content: string, token?: string) {
//   const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews/${reviewId}/add_reply/`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//     body: JSON.stringify({ content }),
//   });

//   if (!res.ok) {
//     const errBody = await res.json().catch(() => null);
//     throw new Error(errBody?.detail || "Failed to add reply");
//   }

//   return res.json();
// }

// export async function markReviewHelpful(reviewId: string, token?: string) {
//   const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews/${reviewId}/mark_helpful/`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//   });

//   if (!res.ok) {
//     const errBody = await res.json().catch(() => null);
//     throw new Error(errBody?.detail || "Failed to mark helpful");
//   }

//   return res.json();
// }

// MARK REVIEW HELPFUL
export async function markReviewHelpful(reviewId: number, token?: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/reviews/${reviewId}/mark_helpful/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  const data = await res.json();

  if (!res.ok) {
      throw new Error(data.detail || "Already marked as helpful");

  }

  return data;
}

// ADD REVIEW REPLY
export async function addReviewReply(
  reviewId: number,
  content: string,
  token?: string
) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/reviews/${reviewId}/add_reply/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to add reply");
  }

  return res.json();
}



export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;            // Full-time, Part-time, Contract
  budget: string;
  skills: string[];
  posted: string;
  is_featured: boolean;
  created_at: string;
}

/**
 * Django Model Structure:
 * 
 * class Job(models.Model):
 *     JOB_TYPES = [
 *         ('full-time', 'Full-time'),
 *         ('part-time', 'Part-time'),
 *         ('contract', 'Contract'),
 *     ]
 *     
 *     title = models.CharField(max_length=200)
 *     company = models.CharField(max_length=200)
 *     location = models.CharField(max_length=200)
 *     type = models.CharField(max_length=20, choices=JOB_TYPES)
 *     budget = models.CharField(max_length=100)
 *     skills = models.JSONField(default=list)
 *     is_featured = models.BooleanField(default=False)
 *     created_at = models.DateTimeField(auto_now_add=True)
 *     
 *     def posted_time_ago(self):
 *         # Calculate time difference
 *         from django.utils import timezone
 *         delta = timezone.now() - self.created_at
 *         if delta.days == 0:
 *             return "Today"
 *         elif delta.days == 1:
 *             return "1 day ago"
 *         else:
 *             return f"{delta.days} days ago"
 * 
 * Django Serializer:
 * 
 * class JobSerializer(serializers.ModelSerializer):
 *     posted = serializers.SerializerMethodField()
 *     
 *     class Meta:
 *         model = Job
 *         fields = '__all__'
 *     
 *     def get_posted(self, obj):
 *         return obj.posted_time_ago()
 */

export async function fetchJobs(params: {
  is_featured?: boolean;
  page?: number;
  page_size?: number;
}): Promise<{ results: Job[]; count: number }> {
  const queryParams = new URLSearchParams();
  
  if (params.is_featured !== undefined) {
    queryParams.append('is_featured', params.is_featured.toString());
  }
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.page_size) queryParams.append('page_size', params.page_size.toString());

  return apiFetch<{ results: Job[]; count: number }>(`/jobs/?${queryParams.toString()}`);
}

export async function fetchFeaturedJobs(): Promise<Job[]> {
  // Django endpoint: /api/jobs/?is_featured=true&page_size=4
  return apiFetch<Job[]>('/jobs/?is_featured=true&page_size=4');
}

// --------------------------------------------
// Testimonials API
// --------------------------------------------
// Django Model: Testimonial

export interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  avatar: string;
  created_at: string;
}

/**
 * Django Model Structure:
 * 
 * class Testimonial(models.Model):
 *     name = models.CharField(max_length=200)
 *     content = models.TextField()
 *     rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
 *     avatar = models.CharField(max_length=10)  # or ImageField
 *     is_approved = models.BooleanField(default=False)  # For moderation
 *     created_at = models.DateTimeField(auto_now_add=True)
 * 
 * Django ViewSet:
 * 
 * class TestimonialViewSet(viewsets.ModelViewSet):
 *     queryset = Testimonial.objects.filter(is_approved=True)
 *     serializer_class = TestimonialSerializer
 */

export async function fetchTestimonials() {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/testimonial/`);
  if (!res.ok) {
    throw new Error("Failed to fetch testimonials");
  }
  return res.json();
}


const handleSubmitTestimonial = async (testimonialData: {
  name: string;
  content: string;
  rating: number;
  avatar: string;
}) => {
  try {
    const saved = await createTestimonial(testimonialData);
    setTestimonials((prev) => [...prev, saved]); // add to local state
  } catch (error: any) {
    console.error(error);
    alert("Failed to submit testimonial: " + error.message);
  }
};



// --------------------------------------------
// Location API (Kenya Counties, Constituencies, Wards)
// --------------------------------------------
// These can be static JSON or from Django database

export interface County {
  name: string;
  code: number;
  capital?: string;
}

export interface Constituency {
  name: string;
}

export interface Ward {
  name: string;
}

/**
 * Django Model Structure (if you want to store locations in DB):
 * 
 * class County(models.Model):
 *     name = models.CharField(max_length=100)
 *     code = models.IntegerField(unique=True)
 *     capital = models.CharField(max_length=100, blank=True)
 * 
 * class Constituency(models.Model):
 *     name = models.CharField(max_length=100)
 *     county = models.ForeignKey(County, on_delete=models.CASCADE, related_name='constituencies')
 * 
 * class Ward(models.Model):
 *     name = models.CharField(max_length=100)
 *     constituency = models.ForeignKey(Constituency, on_delete=models.CASCADE, related_name='wards')
 * 
 * Django ViewSet:
 * 
 * class CountyViewSet(viewsets.ReadOnlyModelViewSet):
 *     queryset = County.objects.all()
 *     serializer_class = CountySerializer
 * 
 * class ConstituencyViewSet(viewsets.ReadOnlyModelViewSet):
 *     serializer_class = ConstituencySerializer
 *     
 *     def get_queryset(self):
 *         county_code = self.request.query_params.get('county_code')
 *         if county_code:
 *             return Constituency.objects.filter(county__code=county_code)
 *         return Constituency.objects.all()
 * 
 * class WardViewSet(viewsets.ReadOnlyModelViewSet):
 *     serializer_class = WardSerializer
 *     
 *     def get_queryset(self):
 *         constituency_id = self.request.query_params.get('constituency_id')
 *         if constituency_id:
 *             return Ward.objects.filter(constituency_id=constituency_id)
 *         return Ward.objects.all()
 */

export async function fetchCounties(): Promise<County[]> {
  // Django endpoint: /api/counties/
  return apiFetch<County[]>('/counties/');
}

export async function fetchConstituencies(countyCode: number): Promise<Constituency[]> {
  // Django endpoint: /api/constituencies/?county_code={countyCode}
  return apiFetch<Constituency[]>(`/constituencies/?county_code=${countyCode}`);
}

export async function fetchWards(constituencyId: number): Promise<Ward[]> {
  // Django endpoint: /api/wards/?constituency_id={constituencyId}
  return apiFetch<Ward[]>(`/wards/?constituency_id=${constituencyId}`);
}
