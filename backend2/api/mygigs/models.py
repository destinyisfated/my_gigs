from time import timezone
from django.db import models
from django.contrib.auth.models import User   
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.html  import mark_safe
from django.conf import settings


# Create your models here.
# class Freelancer(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="freelancer_profile", null=True)
#     profession = models.ForeignKey('Profession', on_delete=models.SET_NULL, null=True, related_name="freelancers")
#     name = models.CharField(max_length=200)
#     email =models.EmailField(null=True)
#     phone=models.CharField(max_length=20, null=True)
#     title = models.CharField(max_length=200)
#     county = models.CharField(max_length=200)
#     constituency = models.CharField(max_length=200)
#     ward = models.CharField(max_length=200)
#     rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
#     reviews = models.IntegerField(default=0)
#     completed_jobs = models.IntegerField(default=0)
#     skills = models.JSONField(default=list)  # or ManyToManyField to Skill model
#     avatar = models.ImageField(upload_to='freelancers/')  # or ImageField for actual images
#     years_experience = models.IntegerField()
#     hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
#     is_featured = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.name
    
#     def image_tag(self):
#         return mark_safe('<img src="%s" width="80" />'% (self.avatar.url))


# class Profession(models.Model):
#     name = models.CharField(max_length=100, unique=True)
#     image = models.ImageField(upload_to='professions/')
#     description = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
     
#     def __str__(self):
#         return self.name
    
#     def get_freelancer_count(self):
#         return self.freelancers.count()
    
#     def image_tag(self):
#         return mark_safe('<img src="%s" width="80" />'% (self.image.url))
class Profession(models.Model):
     """Profession/Category that freelancers can belong to"""
     name = models.CharField(max_length=100, unique=True)
     slug = models.SlugField(unique=True, null=True)
     description = models.TextField(blank=True)
     image = models.ImageField(upload_to='professions/', blank=True, null=True)
     is_active = models.BooleanField(default=True)
     created_at = models.DateTimeField(auto_now_add=True)
     
     class Meta:
         ordering = ['name']
     
     def __str__(self):
         return self.name
     
     @property
     def freelancer_count(self):
         return self.freelancers.filter(is_active=True).count()
     
     def image_tag(self):
        return mark_safe('<img src="%s" width="80" />'% (self.image.url))
        
 
 
class Freelancer(models.Model):
     """Freelancer profile with all details"""
     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='freelancer_profile', null=True)
     profession = models.ForeignKey(Profession, on_delete=models.SET_NULL, null=True, related_name='freelancers')
     
     # Personal info
     name = models.CharField(max_length=255)
     email = models.EmailField(unique=True, null=True)
     phone = models.CharField(max_length=20, blank=True)
     avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
     bio = models.TextField(blank=True)
     
     # Location - hierarchical (County > Constituency > Ward)
     county = models.CharField(max_length=100)
     county_code = models.IntegerField(null=True, blank=True)
     constituency = models.CharField(max_length=100, blank=True)
     ward = models.CharField(max_length=100, blank=True)
     
     # Professional details
     hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
     years_experience = models.IntegerField(default=0)
     skills = models.JSONField(default=list)  # Array of skill strings
     
     # Stats (computed or denormalized)
     rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
     review_count = models.IntegerField(default=0)
     completed_jobs = models.IntegerField(default=0)
     
     # Status
     is_active = models.BooleanField(default=True)
     is_featured = models.BooleanField(default=False)
     availability = models.CharField(max_length=20, default='available')  # available, busy, unavailable
     
     # Timestamps
     created_at = models.DateTimeField(auto_now_add=True)
     updated_at = models.DateTimeField(auto_now=True)
     
     class Meta:
         ordering = ['-rating', '-completed_jobs']
         indexes = [
             models.Index(fields=['profession', 'is_active']),
             models.Index(fields=['county', 'is_active']),
             models.Index(fields=['rating']),
         ]
     
     def __str__(self):
         return f"{self.name} - {self.profession.name if self.profession else 'No Profession'}"
     def image_tag(self):
        return mark_safe('<img src="%s" width="80" />'% (self.avatar.url))
 
 

class Review(models.Model):
    freelancer = models.ForeignKey('Freelancer', on_delete=models.CASCADE, related_name='review')
    client = models.ForeignKey(User, on_delete=models.CASCADE)
    client_name = models.CharField(max_length=200)
    client_avatar = models.CharField(max_length=10)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    content = models.TextField()
    helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
 
    def __str__(self):
        return self.freelancer.name + " - " + str(self.rating)
class ReviewReply(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="replies")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Job(models.Model):
    JOB_TYPES = [
         ('full-time', 'Full-time'),
         ('part-time', 'Part-time'),
         ('contract', 'Contract'),
     ]
     
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=JOB_TYPES)
    budget = models.CharField(max_length=100)
    skills = models.JSONField(default=list)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
     
    def posted_time_ago(self):
          # Calculate time difference
         from django.utils import timezone
         delta = timezone.now() - self.created_at
         if delta.days == 0:
             return "Today"
         elif delta.days == 1:
             return "1 day ago"
         else:
             return f"{delta.days} days ago"
 

class Testimonial(models.Model):
    name = models.CharField(max_length=200)
    content = models.TextField()
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    avatar = models.CharField(max_length=10)  # or ImageField
    is_approved = models.BooleanField(default=False)  # For moderation
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ReviewHelpful(models.Model):
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name="helpful_votes"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("review", "user")

