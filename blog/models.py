from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.contrib.auth.models import User

# Create your models here.

class Avatar(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField()
    bio = models.CharField(max_length=100)
    username = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Story(models.Model):
    author = models.ForeignKey(Avatar, on_delete=models.CASCADE)
    active = models.BooleanField(default=False, null=True)
    image = models.ImageField(null=True,blank=True)
    video = models.FileField(null=True,blank=True)

    def __str__(self):
        return self.author.name
    

class Post(models.Model):
    comment = models.CharField(max_length=500, null=True)
    post_image = models.ImageField()
    author = models.ForeignKey(Avatar, on_delete=models.CASCADE, null=True)
    date = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.comment
    


class FolowersCount(models.Model):
    follower = models.CharField(max_length=1000)
    user = models.CharField(max_length=1000)

    def __str__(self):
        return self.user


class Comment(models.Model):
    pass
