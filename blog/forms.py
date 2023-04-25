from django import forms
from .models import *


class PostForm(forms.ModelForm):
    comment = forms.CharField(widget=forms.TextInput(attrs={'class':'textarea'}),label='Comment')

    class Meta:
        model = Post
        fields = ['post_image','author','comment']

class StoryForm(forms.ModelForm):
    
    class Meta:
        model = Story
        fields = '__all__'



class AvatarForm(forms.ModelForm):
    name = forms.CharField(widget=forms.TextInput(attrs={'class':'input', 'placeholder': "Name kiriting"}))
    bio = forms.CharField(widget=forms.TextInput(attrs={'class':'input'}),label='Comment')

    class Meta:
        model = Avatar
        fields = '__all__'