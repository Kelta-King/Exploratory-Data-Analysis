from django.urls import path
from . import views

urlpatterns = [
    path('', views.homePageEda),
    path('setPath', views.setPath),
    path('getRows', views.getRows),
    path('setDependentVariables', views.setDependentVariables),
    path('getDimension', views.getDimension),
    path('getColumnNames', views.getColumnNames),
    path('getDistinctedColumns', views.getDistinctedColumns),
    path('getSelectedColumns', views.getSelectedColumns),
    path('getIndipendentColumns', views.getIndipendentColumns),
    path('getNumericalColumns', views.getNumericalColumns),
    path('getNumericalIndipendentColumns', views.getNumericalIndipendentColumns),
    path('getDynamicScatterPlot', views.getDynamicScatterPlot),
    path('get2DPlot', views.get2DPlot),
    path('getStatsOfColumns', views.getStatsOfColumns),
    path('pieChartData', views.pieChartData),
    path('getPairPlot', views.getPairPlot),
    path('getCorelationPlot', views.getCorelationPlot),
]
