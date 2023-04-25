from django.shortcuts import render, redirect
from .models import *
from .forms import *
from django.shortcuts import render
from .forms import *
from django.db.models import Q

# Create your views here.


def main(request):
    user = Avatar.objects.filter(username=request.user).first()
    stories = Story.objects.all()
    followers = Avatar.objects.all()
    post = Post.objects.all().order_by('-date')
    return render(request, 'index.html', {'followers': followers, 'posts': post, 'user': user,'stories':stories})


def post(request):
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('main')
    else:
        form = PostForm()
    return render(request, 'post.html', {'form': form})


def story(request):
    stors = StoryForm(request.POST,request.FILES)
    if request.method == 'POST':
        if stors.is_valid():
            stors.save()
            return redirect('main')
    else:
        stors = PostForm()
    return render(request, 'story.html', {'stors': stors})


def profile(request):
    user_id = request.GET.get("user_id")
    userForMassage = request.user
    userInfo = Avatar.objects.filter(id=user_id).first()
    posts = Post.objects.filter(author=userInfo)
   
    user = Avatar.objects.filter(username=request.user).first()
    users = Post.objects.all()
    if request.method == 'POST':
        form = AvatarForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('main')
    form = AvatarForm()
    return render(request, 'profile.html', {"user": user, 'users': users, 'form': form, "userInfo": userInfo, 'posts': posts, "userForMassage": userForMassage})


def searchs(request):
    search = request.GET.get('Search')
    posts = Post.objects.all().order_by('date')
    posts = posts.filter(Q(title__icontains=search) | Q(text_icontains=search))
    return render(request, 'index.html', {'posts': posts})


def floow(request):
    pass


def homea(request):
    return render(request, 'index.html')


def nast(request):
    return render(request, 'nast.html')
