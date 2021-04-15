from django.shortcuts import render
from django.http import HttpResponse
# Create your views here.

def homePageAbout(request):
    return render(request, "aboutPage.html")