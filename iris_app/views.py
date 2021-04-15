from django.shortcuts import render
from django.http import HttpResponse

def homePage(request):
    if request.method == "GET":
        error = request.GET.get('error', '')
        if(error):
            return render(request, 'irisAppHome.html', {"error":error})
    
    return render(request, 'irisAppHome.html')
