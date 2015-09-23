 var SonarService = {
     //
     // Check if authorized for Sonar API
     // return status
     //
    isAuthorized: function(url)  {
    	   var dfr = $.Deferred();
    	   $.when(jQuery.ajax({
                   url: url + '/api/projects',
		   crossDomain: true,
    		   dataType: 'jsonp',
                   timeout: 3000,
                   success: function(1) {
                        dfr.resolve();
                   },
                   error: function(0) {
                        dfr.reject();
                   }
    		})).then(function(data) {
    		       dfr.resolve(data);
    		});
    		return dfr.promise();
     },
     //
     // Return project list
     // return an array of [name]
     //
    getProjects: function(url)  {
    	   var dfr = $.Deferred();
    	   var projects = new Array();
    	   $.when(jQuery.ajax({
                   url: url + "/api/projects",
    			   crossDomain: true,
    			   dataType: 'jsonp'
    		})).then(function(data) {
    			    for (i=0; i < data.length; i++) {
    				   projects[i] = data[i].k;
    			    }
    				dfr.resolve(projects);
    		});
    		return dfr.promise();
     },
     //
	 // Return historical metrics for a project
	 // return an array of [date, measure]
	 //
     getHistoricalMetrics: function(url, key, metric, toArray)  {
        var dfr = Ext.create('Deft.Deferred');
        if (key.split(",").length > 1) {
             Deft.Promise.all([this.combineHistoricalMetrics(url, key, metric, toArray)])
                .then({ success: function(recordSets) {
                         toArray = recordSets[0];
                         dfr.resolve(toArray);
                   }});
        } else {
           if (url.indexOf("?") < 0)   {
               url = url + "/api/timemachine?resource="+$.trim(key)+"&metrics="+metric
           } else {
               url = url + "/api/timemachine&resource="+$.trim(key)+"&metrics="+metric
           }
           $.when(jQuery.ajax({
                   url: url,
                   crossDomain: true,
                   dataType: 'jsonp'
            })).then(function(records) {
               for (i=0; i < records[0].cells.length; i++) {
                  toArray[records[0].cells[i].d] = records[0].cells[i].v[0];
              }
              dfr.resolve(toArray);
            });
        }
        return dfr.promise;
    },
    //
    // Return historical metrics for 1+ projects
    // return an array of [date, measure]
    //
    combineHistoricalMetrics: function(url, key, metric, toArray)  {
       var dfr = Ext.create('Deft.Deferred');
       var projects = key.split(",");
       var multiProjArray = new Array();
       var promises = new Array();
       for (m=0; m<projects.length; m++) {
          multiProjArray[m] = new Array();
          promises.push(this.getHistoricalMetrics(url, $.trim(projects[m]), "ncloc", multiProjArray[m]));
       }
       Deft.Promise.all(promises).then({
           success:function(sRecords) {
               var prevbase;
               for (basedate in sRecords[0]) {
                  var addMetric = 0;
                  prevbase = basedate;
                  for (comparedate in sRecords[1]) {
                      if (comparedate > basedate) {
                             break;
                      }  else {
                             addMetric = sRecords[1][comparedate];
                      }
                  }
                  sRecords[0][prevbase] += addMetric;
               }
               toArray = sRecords[0];
               dfr.resolve(toArray);
       }});
       return dfr.promise;
     },
	 //
	 // Return current metrics for a project
	 // return an array of [metric-name, measure]
	 //
    getMetrics: function(url, project)  {
	   var metrics = new Array();
	   jQuery.ajax({
               url: url + "/api/resources?resource="+project+"&metrics=ncloc,classes,lines,class_complexity,function_complexity",
			   crossDomain: true,
			   dataType: 'jsonp',
			   async: false,
			   success: function(data, textStatus, jqXHR) {
			      for (i=0; i < data[0].msr.length; i++) {
					  metrics[data[0].msr[i].key] = data[0].msr[i].val;
			      }
				}
		});
		return metrics;
    }
 }
