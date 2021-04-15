from django.shortcuts import render
from django.http import HttpResponse
import pandas as pd
import json
from io import BytesIO
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import os, sys

#Colors list, it will be used for setting class colors
colors = ['red', 'blue', 'green', 'maroon', 'pink', 'yellow', 'black']

# Main dictionary
df_dataset = {
    'df': pd.DataFrame(),
    'dependentVariables':[],
    'independentVariables':[],
    'allVariables':[],
    'dependentVarsClass':{},
    'dependentColors':{},
    'numericalVariables':[],
    'categoricalVariables':[],
}

# dependentVarsClass has {[], []} structure
# dependentColors has {{} , {}} structure

# Renders eda page
def homePageEda(request):
    return render(request, "eda.html")

def setPath(request):
    
    try:
        if request.method == "GET":
            
            # Getting path from the user
            path = json.loads(str(request.GET.get("path")))
            
            # If . is not in the path then no file name is given
            if "." not in str(path):
                return HttpResponse("Error: Please Provide file name")
            
            # Getting filename and extension
            filename, ext = str(path).split('.')

            try: 
                # Checking by extensions
                if ext == "xlsx":
                    df_dataset['df'] = pd.read_excel(path)

                elif ext == "csv":
                    df_dataset['df'] = pd.read_csv(path)
                    
                else:
                    df_dataset['df'] = pd.read_excel(path)

            except Exception as e:
                print(e)
                return HttpResponse("Error: " + str(e))

            return HttpResponse("File path: <b>"+path+"</b>")

    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))
        
def getColumnNames(request):
    
    try:
        if request.method == "GET":

            # Using the dataset from the dictionary
            df = df_dataset['df']
            
            # Converting df.columns into a list so that later it can be transmitted by json
            column_names = list(df.columns)
            
            # Set all variables in main variable df
            df_dataset['allVariables'] = column_names

            # Numerical varibles list
            numericalVariables = list()

            # Categorical Variables list
            categoricalVariables = list()

            for x in column_names:

                # dType saving
                dType = df[x].dtype
                
                if dType == 'object':
                    # String type
                    categoricalVariables.append(x)

                else:
                    # Numerical datatype
                    numericalVariables.append(x)

            df_dataset['numericalVariables'] = numericalVariables
            df_dataset['categoricalVariables'] = categoricalVariables

            # Json conversion
            dimensionStr = json.dumps(column_names)
            return HttpResponse(dimensionStr)

        else:
            return HttpResponse("Something went wrong")
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

def setDependentVariables(request):
    
    try:
        # Get and parse json which contains data from frontend
        dependent = json.loads(request.GET.get("names"))

        # Setting dependent variables
        df_dataset['dependentVariables'] = dependent

        # Getting independent variables
        # getting all those values who are not in dependent variable but they are in allVariables
        df_dataset['independentVariables'] = [i for i in df_dataset['allVariables'] if i not in df_dataset['dependentVariables']]
                
        response = "Dependent Variables are set. You can go further. <br>Dependent Variables: <b>",str(df_dataset['dependentVariables']),"</b>"

        # Here more than one dependent variable case comes
        # First of all making that dictionary empty
        df_dataset['dependentVarsClass'] = {}
        # Iterating for all dependent variables
        for variable in df_dataset['dependentVariables']:

            # store all unique entries of that dependent variable in temp variable
            # dropna removes all nan
            temp = df_dataset['df'][variable].dropna().unique()
            
            # varColors will hold the respective color value for each unique value
            varColors = {}
            i = 0

            # Iteration through each unique value for color assignment
            for t in temp:
                    
                # If colors are less than unique values then it will start assigning colors from i=0 again
                if i >= len(colors):
                    i = 0
                    
                # Assign color
                varColors[t] = colors[i]
                i = i + 1

            # Update the main variable's dependent colors
            df_dataset['dependentColors'][variable] = varColors
                
            # Update the main variable's dependent vars class
            df_dataset['dependentVarsClass'][variable] = temp
            
        return HttpResponse(response)
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))
    

def getIndipendentColumns(request):

    try:
        # Here if user has not set the dependent variables then error will come
        if not df_dataset['independentVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        if request.method == "GET":

            # Using the independent variables from the dictionary
            independentVariables = df_dataset['independentVariables']
        
            # Json conversion
            colms = json.dumps(independentVariables)
            return HttpResponse(colms)

        else:
            return HttpResponse("Something went wrong")
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

def getNumericalColumns(request):

    try:
        # Here if user has not set the dependent variables then error will come
        if not df_dataset['numericalVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        if request.method == "GET":

            # Using the numerical variables from the dictionary
            numericalVariables = df_dataset['numericalVariables']
        
            # Json conversion
            colms = json.dumps(numericalVariables)
            return HttpResponse(colms)

        else:
            return HttpResponse("Something went wrong")
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

def intersection(lst1, lst2):
    return list(set(lst1) & set(lst2))

def getNumericalIndipendentColumns(request):

    try:
        # Here if user has not set the dependent variables then error will come
        if not df_dataset['numericalVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        if not df_dataset['independentVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        if request.method == "GET":

            # Using the numerical variables from the dictionary
            numericalIndipendentVariables = intersection(df_dataset['numericalVariables'], df_dataset['independentVariables'])
        
            # Json conversion
            colms = json.dumps(numericalIndipendentVariables)
            return HttpResponse(colms)

        else:
            return HttpResponse("Something went wrong")
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

# Returns a list with 1st index contains dependent columns and 2nd index contains indepenedent columns
def getDistinctedColumns(request):

    try:
        if not df_dataset['independentVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        if not df_dataset['dependentVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        if request.method == "GET":

            # Makinf distincted columns list
            distinctedColumns = list()

            # Adding dependent variables
            distinctedColumns.append(df_dataset['dependentVariables'])

            # Adding independent variables
            distinctedColumns.append(df_dataset['independentVariables'])
        
            # Json conversion
            colms = json.dumps(distinctedColumns)
            return HttpResponse(colms)

        else:
            return HttpResponse("Something went wrong")
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

def getRows(request):

    try:
        if request.method == "GET":
            
            # Getting user's input by GET method
            n = int(request.GET.get("count"))

            if n is None:
                return HttpResponse("Something went wrong")
            
            df = df_dataset['df']
        
            # Select first n entries
            val = df.head(n)

            # Convert to json and send to frontend
            json = val.to_json() 
            
            return HttpResponse(json)
        else:
            return HttpResponse("Something went wrong")
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

def getDimension(request):

    try:
        if request.method == "GET":

            # Making list to hold shape, row count and column count
            dimensionStr = list()
            df = df_dataset['df']
            
            # Shape of dataframe
            shape = str(df.shape)
            dimensionStr.append(shape)

            # Rows Count
            rows_count = len(df.index)
            dimensionStr.append(rows_count)

            # Column counts
            column_count = len(df.columns)
            dimensionStr.append(column_count)

            # JSon conversion
            dimensionStr = json.dumps(dimensionStr)
            
            return HttpResponse(dimensionStr)
        else:
            return HttpResponse("Something went wrong")
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

def getSelectedColumns(request):
    
    try:
        if request.method == "GET":
            
            # Getting columns name in Json format
            cols = request.GET.get("cols")
            
            if cols is None:
                return HttpResponse("Something went wrong")

            # Parsing Json
            cols = json.loads(cols)
            
            # Here we need specified columns to be shown
            # So, we have to read the csv file again with usecols = cols parameter
            # So that it will read only those columns
            
            df = df_dataset['df']
            df = df[cols]
            
            # Converting to Json and sending to Frontend
            # Object of type dataframe is no serializable using json.dumps
            # So to_json() is used
            df = df.to_json()

            return HttpResponse(df)
        else:
            return HttpResponse("Something went wrong")

    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

def get_graph():

    try:
        buffer = BytesIO()
        plt.savefig(buffer, format = 'png')
        
        buffer.seek(0)
        img_png = buffer.getvalue()
        
        graph = base64.b64encode(img_png)
        graph = graph.decode('utf-8')
        
        buffer.close()
        return graph
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

def getDynamicScatterPlot(request):

    try:
        # Here if user has not set the dependent variables then error will come
        if not df_dataset['independentVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        # In case of more than 1 amount of dependent variables then it will send respective amount of images
        # For 2 dependent variables 2 Images

        df = df_dataset['df']
        vals = request.GET.get("vals")
        vals = json.loads(vals)

        # images variable to store all images graph. Later it will be rendered through json
        images = list()

        # Getting x and y axis from user
        xAxis = vals['xAxis']
        yAxis = vals['yAxis']

        # Get all dependent variables
        dependentVars = df_dataset['dependentVariables']

        # Iterate through all dependent variables
        for var in dependentVars:

            # Get all unique values
            classValues = df_dataset['dependentVarsClass'][var]
            legends = []
                
            # Iterate through all unique values
            for value in classValues:
                    
                # Copy dataset
                temp = df.copy()
                
                if isinstance(value, str):
                    temp.query(str(var)+' == "%s"' % value , inplace = True)
                else:
                    temp.query(str(var)+' == '+str(value) , inplace = True)
                
                # Run query on copied dataset to filter entries
                
                x = list(temp[xAxis])
                y = list(temp[yAxis])

                # Plot for that perticular unique value
                lt = plt.scatter(x, y, color = df_dataset['dependentColors'][var][value])
                legends.append(lt)
                
            
            # Add x and y labels
            plt.xlabel(xAxis)
            plt.ylabel(yAxis)

            # Setting title for this plot
            plt.title("scatter plot for dependent variable: " + var)

            # Write lengends
            plt.legend(legends, classValues, scatterpoints=1, ncol=3, fontsize=8)

            # Get graph and store it in images list
            graph = get_graph()
            images.append(graph)

            # Clear graph for next plot
            plt.clf()
            
        # Convet images to json and send it to frontend
        images = json.dumps(images)
        return HttpResponse(images)
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))
    
def get2DPlot(request):
    
    try:
        # Images list
        images = list()
        
        # Getting values
        vals = request.GET.get("vals")
        vals = json.loads(vals)

        # Distinguishing values
        xAxis = vals['xAxis']
        yAxis = vals['yAxis']

        # Getting dataset
        df = df_dataset['df']
        
        # If it is object then show count plot
        if df[yAxis].dtype == "object":
            # Count plot will be shown
            sns.countplot(x = xAxis, hue = yAxis, data = df).set_title("Count plot for " + yAxis)

        else:
            # Box plot will be shown
            sns.boxplot(x = xAxis, y = yAxis, data = df).set_title("Box Plot for " + yAxis)

        graph = get_graph()
        
        # Clearing graph
        plt.clf()
        images.append(graph)
        # Json conversion
        images = json.dumps(images)
        return HttpResponse(images)
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

def pieChartData(request):

    try:
        # Here if user has not set the dependent variables then error will come
        if not df_dataset['independentVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        df = df_dataset['df']

        # lists for the help in plotting
        images = list()
        sizes = list()
        labels = list()
        explode = list()
            
        # Here also, if more than 1 dependent variable than respective count of images will be send to user
        # Get all dependent variables
        dependentVars = df_dataset['dependentVariables']

        # Iterate through all dependent variables
        for var in dependentVars:

            # Get all unique values
            classValues = df_dataset['dependentVarsClass'][var]
            legends = []
            tempDict = {}
                
            # Iterate through all unique values
            for value in classValues:
                    
                # Copy dataset
                temp = df.copy()
                if isinstance(value, str):
                    temp.query(str(var)+' == "%s"' % value , inplace = True)
                else:
                    temp.query(str(var)+' == '+str(value) , inplace = True)
                
                # Getting the rows count for this value
                temp_size = len(temp.index)
                s = 'Count of ' + str(value)

                # Setting tempDict for frontend
                tempDict[s] = temp_size

                # Saving labels and sizes for the later plotting
                labels.append(value)
                sizes.append(temp_size)
                explode.append(0)
                
            # Plotting pie plot 
            plt.pie(sizes, explode=explode, labels=labels, autopct='%1.1f%%', shadow=True, startangle=90)
            plt.axis('equal')

            plt.title("Pie chart for dependent variable: " + var)

            # Image url for forntend
            graph = get_graph()
            tempDict['image'] = graph
            images.append(tempDict)

            plt.clf()

            # Resetting empty list beacause of reuse of this variables for other dependent variable plot
            sizes = list()
            labels = list()
            explode = list()

        images = json.dumps(images)

        return HttpResponse(images)
        
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))
    

def getStatsOfColumns(request):
    
    try:
        
        # Here if user has not set the dependent variables then error will come
        if not df_dataset['dependentVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        df = df_dataset['df']
                
        vals = request.GET.get("vals")
        vals = json.loads(vals)

        # Getting column and operations from front end
        column = vals['column']
        operation = vals['operation']
        print(column)
        print(operation)

        # Here if amount of dependent variables are more than one then respective amount of images will be sent
        # List which will hold all the images url and other strings
        details = list()
        # Getting total dependent variables
        dependentVars = df_dataset['dependentVariables']

        # Iterate through all dependent variables
        for var in dependentVars:
                
            # Get all unique values
            classValues = df_dataset['dependentVarsClass'][var]
            legends = []
            tempDict = {}
            yLabel = ""
            titleLabel = ""

            # If operation is for univariate analysis then we will use seaborn and we will not need to 
            # iterate all the classes of a dependent variable. So we will compute it here.
            if operation == "univariateAnalysis":

                # Style setting
                sns.set_style('ticks')
                fig = plt.figure(figsize = (15,10))

                # Plotting with kdeplot mapping
                g = sns.FacetGrid(df, hue = var, height = 5).map(sns.kdeplot, column).add_legend()
                yLabel = column+" kde plot on the basis of dependent variable"
                #titleLabel = "Univariate Analysis for " + var
                titleLabel = column+" kde plot on the basis of dependent variable"

                # Setting title
                g.fig.suptitle(titleLabel, size = 16)

                # Adjusting the title to look nice
                g.fig.subplots_adjust(top=.9)

                # xLabel for plot
                plt.xlabel(column + " Univariate Analysis")
            
            else:

                # Iterate through all unique values
                for value in classValues:
                            
                    # Copy dataset
                    temp = df.copy()
                            
                    # Variable to store the count for frontend
                    varDetail = ""
                            
                    # Run query on copied dataset to filter entries
                    if isinstance(value, str):
                        temp.query(str(var)+' == "%s"' % value , inplace = True)
                    else:
                        temp.query(str(var)+' == '+str(value) , inplace = True)
                            
                    # Converting into numpy array
                    temp = np.array(temp[column])

                    # Checking the operation and then performing accordingly
                    if operation == "Total":

                        # Calculating sum with 2 precision
                        tempSum = round(np.nansum(temp), 2)
                        # Getting color for that value
                                
                        tempColor = df_dataset['dependentColors'][var][value]
                        plt.bar(str(value), tempSum, color = tempColor, width = 0.4)

                        # This detail will show the sum of this value in frontend
                        varDetail = "Sum for " + str(value) + ": <b>" + str(tempSum) + "</b>"
                        yLabel = "Sum of "+column+" for each classes"
                        titleLabel = "Sum of " + column + " on the basis of dependent variable"
                                

                    elif operation == "Average":

                        # Calculation average with 2 precision
                        tempAvg = round(np.nanmean(temp), 2)
                                
                        # Getting color for that value
                        tempColor = df_dataset['dependentColors'][var][value]
                        plt.bar(str(value), tempAvg, color = tempColor, width = 0.4)

                        # This detail will show the average of this value in frontend
                        varDetail = "Average for " + str(value) + ": <b>" + str(tempAvg) + "</b>"
                        yLabel = "Average of "+column+" for each classes"
                        titleLabel = "Average of " + column + " on the basis of dependent variable"

                    elif operation == "Frequency":

                        # Calculation total count
                        tempCount = len(temp)
                                
                        # Getting color for that value
                        tempColor = df_dataset['dependentColors'][var][value]
                        plt.bar(str(value), tempCount, color = tempColor, width = 0.4)

                        # This detail will show the average of this value in frontend
                        varDetail = "Frequency for " + str(value) + ": <b>" + str(tempCount) + "</b>"
                        yLabel = "Frequency of "+column
                        titleLabel = "Frequency of " + column + " on the basis of dependent variable"

                    else:
                        print("Somethig went wrong")
                        # This will be handled in frontend
                        return HttpResponse("Error: Something went wrong")

                    # Adding the details value for the frontend
                    tempDict[str(value)] = varDetail

                # Labels for plot
                plt.ylabel(yLabel)
                plt.title(titleLabel)
                plt.xlabel("Dependent variable classes")

            graph = get_graph()
            plt.clf()

            # Setting image's url
            tempDict['image'] = graph

            # Appending the dictionary of this perticular dependent variable
            details.append(tempDict)

        # JSON conversion
        val = json.dumps(details)

        return HttpResponse(val)
    
    except Exception as e:
        # Getting exception details
        print(e)
        return HttpResponse("Error: " + str(e))
    

def getPairPlot(request):
    
    try:
        # Here if user has not set the dependent variables then error will come
        if not df_dataset['dependentVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        # Here if more than 1 dependent variables comes then respective pair plot will be provided
        # Getting total dependent variables
        dependentVars = df_dataset['dependentVariables']
        
        # list for images
        images = list()

        # Iterate through all dependent variables
        for var in dependentVars:

            # Setting style
            sns.set_style('ticks')

            temp = df_dataset['df']

            # Setting title for the pair plot
            # This will help to distinguish pair plots for more than one dependent variables
            titlePairPlot = "Pair Plot for " + var

            # Plotting the plot with seaborn
            g = sns.pairplot(temp, hue = var, height = 3)

            # Setting title
            g.fig.suptitle(titlePairPlot, size = 24)

            # Adjusting the title to look nice
            g.fig.subplots_adjust(top=.9)

            graph = get_graph()

            # Saving the image in list
            images.append(graph)
            plt.clf()

        # conveting list to JSON 
        images = json.dumps(images)

        return HttpResponse(images)
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))

def getCorelationPlot(request):
    
    try: 
        # Here if user has not set the dependent variables then error will come
        if not df_dataset['dependentVariables']:
            return HttpResponse("Error: Please select dependent variables first")

        # Here only one image will be sent to the front end
        # Because correlation between independent variables are always the same
        df = df_dataset['df']

        # Now we only need independent columns of this dataset
        independentVariables = df_dataset['independentVariables']

        independent_df = df[independentVariables]
        
        sns.set_style('ticks')

        # Setting figure for the proper image in frontend 
        fig = plt.figure(figsize = (15,9))

        # Plotting correlation heatmap
        sns.heatmap(independent_df.corr(), cmap='Blues', annot = True)

        graph = get_graph()
        plt.clf()

        # Sending simple graph url to user
        return HttpResponse(graph)
    
    except Exception as e:
        print(e)
        return HttpResponse("Error: " + str(e))
