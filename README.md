#### Defect-Rate
##### Purpose
---
This application calculates density of defects per size of a software project.
Current defect counts and total lines of code are acquired by Rally and Sonar web services. 

**_Density = Defects / (Non-Comment Lines Of Code/1000)_** 

The accepted industry standard for defect density is **1 defect per 1 Kloc**. 

##### Design
---
* 3rd party web serivces are invoked to acquire the necessary defect and sprint data:
  * Rally services are called to find Sprint start/end dates and defects.
  * Sonar services are called to find Non-Commented Lines of Code by date.
* Calculations are performed:
  * Find defect counts (open, closed, discovered) at the end of each sprint
  * Determine the NLOC for the project at the end of each sprint
  * Calculate defect density or rate  ==> number defects / 1K NCLOC
* Build graphs
  * Use Google graph api to render graphs
  
##### Usage
---
This application can be integrated onto your Rally dashboard.

Click the gear in the top right hand corner,
and select "Add App". Enter "Custom" in the search box,
and select "Custom HTML". Type in "Defect Density"
as the App title, and paste in the HTML
source copied from App.html.txt. 
To integrate the application onto your dashboard to process
multiple Rally projects, paste in the HTML source 
from App-noDialog.html.txt. 
You will need to edit the 'rallyKey' and 'sonarKey' values
inside the source which represent the Rally project names
and Sonar project names respectively.
Project names are delimited by a pipe "|". 


