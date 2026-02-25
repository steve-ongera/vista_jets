from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin-system/', admin.site.urls),
    path('api/v1/', include('flights.urls')),
]