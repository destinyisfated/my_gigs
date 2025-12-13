from django.contrib import admin

from .models import Freelancer, Profession, Review, ReviewReply, Job, Testimonial

# Register your models here.

class ProfessionAdmin(admin.ModelAdmin):
    list_display = ('name','description', 'image_tag')
admin.site.register(Profession, ProfessionAdmin)

class FreelancerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'county', 'constituency', 'ward', 'rating', 'created_at', 'image_tag')
    search_fields = ('name', 'phone', 'county', 'constituency', 'ward')
    list_filter = ('is_featured', 'created_at')
    ordering = ('-created_at',)
admin.site.register(Freelancer, FreelancerAdmin)


class ReviewAdmin(admin.ModelAdmin):
    list_display = ('freelancer', 'client_name', 'rating', 'helpful_count', 'created_at')
    search_fields = ('freelancer__name', 'client_name', 'content')
    list_filter = ('rating', 'created_at')
    ordering = ('-created_at',)
admin.site.register(Review, ReviewAdmin)

class ReviewReplyAdmin(admin.ModelAdmin):
    list_display = ('review', 'content', 'created_at')
    search_fields = ('review__client_name', 'content')
    ordering = ('-created_at',)
admin.site.register(ReviewReply, ReviewReplyAdmin)

class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'location' )
    search_fields = ('title', 'company', 'location')

   
admin.site.register(Job, JobAdmin)  

# class TestimonialAdmin(admin.ModelAdmin):
#     list_display = ('name', 'content', 'rating', 'created_at')
#     search_fields = ('name', 'freelancer__name', 'content')
#     list_filter = ('rating', 'created_at')
#     ordering = ('-created_at',)
# admin.site.register(Testimonial, TestimonialAdmin)

class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "rating", "is_approved", "created_at")
    list_filter = ("is_approved", "rating")
    actions = ["approve_testimonials"]

    def approve_testimonials(self, request, queryset):
        queryset.update(is_approved=True)
admin.site.register(Testimonial, TestimonialAdmin)