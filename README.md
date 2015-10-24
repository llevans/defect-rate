#### Defect-Rate
##### Purpose
---
Defect rate appliction to be integrated with a Rally dashboard.
Calculate the number of open defects occuring at each Sprint end-date to be represented in a line graph.

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
