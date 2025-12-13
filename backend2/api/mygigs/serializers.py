

from rest_framework import serializers
from .models import Freelancer, Job, Profession, Review, ReviewReply, Testimonial


class ProfessionSerializer(serializers.ModelSerializer):
    count = serializers.SerializerMethodField()
    imageUrl = serializers.SerializerMethodField()
    
    class Meta:
        model = Profession
        fields = ['id', 'name', 'description', 'imageUrl', 'count']
    
    def get_count(self, obj):
        return obj.freelancers.filter(is_active=True).count()
    
    def get_imageUrl(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url)
        return None

# class FreelancerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Freelancer
#         fields = "__all__"

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Freelancer, Profession
from users.models import ClerkProfile

class FreelancerSerializer(serializers.ModelSerializer):
    # Nested fields for User
    user_email = serializers.EmailField(source="user.email", required=False)
    user_first_name = serializers.CharField(source="user.first_name", required=False)
    user_last_name = serializers.CharField(source="user.last_name", required=False)
    avatar_url = serializers.URLField(source="user.clerk_profile.profile_image", required=False)

    class Meta:
        model = Freelancer
        fields ="__all__"
            
        read_only_fields = ["rating", "review_count", "completed_jobs", "created_at", "updated_at"]

    def update(self, instance, validated_data):
        # 1️⃣ Update nested User fields
        user_data = validated_data.pop("user", {})
        if instance.user:
            for attr, value in user_data.items():
                if attr == "clerk_profile" and value.get("profile_image"):
                    # Update ClerkProfile image if provided
                    clerk_profile, _ = ClerkProfile.objects.get_or_create(user=instance.user)
                    clerk_profile.profile_image = value["profile_image"]
                    clerk_profile.save()
                else:
                    setattr(instance.user, attr, value)
            instance.user.save()

        # 2️⃣ Update Freelancer fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class FreelancerListSerializer(serializers.ModelSerializer):
    """Serializer for listing freelancers (lightweight)"""
    profession_name = serializers.CharField(source='profession.name', read_only=True)
    avatar_initials = serializers.SerializerMethodField()
    
    class Meta:
        model = Freelancer
        fields = [
            'id', 'name', 'profession_name', 'county', 'constituency', 'ward',
            'rating', 'review_count', 'hourly_rate', 'years_experience',
            'completed_jobs', 'skills', 'avatar', 'avatar_initials', 'availability'
        ]
    
    def get_avatar_initials(self, obj):
        parts = obj.name.split()
        if len(parts) >= 2:
            return f"{parts[0][0]}{parts[1][0]}".upper()
        return obj.name[:2].upper()


class FreelancerDetailSerializer(serializers.ModelSerializer):
    """Full serializer for freelancer detail page"""
    profession = ProfessionSerializer(read_only=True)
    reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Freelancer
        fields = '__all__'
    
    def get_reviews(self, obj):
        reviews = obj.review.all().order_by('-created_at')[:5]
        return ReviewSerializer(reviews, many=True).data


class ReviewReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewReply
        fields = "__all__"
        read_only_fields = ("id", "review", "created_at")
class ReviewSerializer(serializers.ModelSerializer):
    replies = ReviewReplySerializer(many=True, read_only=True)
    content = serializers.CharField(required=True, allow_blank=False)
    class Meta:
        model = Review
        fields = [
            "id",
            "freelancer",
            "client",
            "client_name",
            "client_avatar",
            "rating",
            "content",
            "helpful_count",
            "created_at",
            "replies"
        ]
        read_only_fields = (
            "id",
            "freelancer",
            "client",
            "client_name",
            "client_avatar",
            "helpful_count",
            "created_at",
            "replies",
        )

class JobSerializer(serializers.ModelSerializer):
    posted = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = '__all__'
    
    def get_posted(self, obj):
        return obj.posted_time_ago()
    
class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'
        read_only_fields = ("is_approved", "created_at")