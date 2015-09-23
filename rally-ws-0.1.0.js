 var RallyService = {

     hasIterations: functio() {
     },

     getParentPortfolioProject: functio() {
      //get _itemHierachy of current project, pull HierarchicalRequirements
      //at intersection of _itemHierarchy of a UserStory and portfolioProjectsInWorkspace == parentPortfolioProject
     },

     getProjectsInPortfolio: function() {
      //get _itemHierarchy (leaves) of portfolioProjectsInWorkspace
      //at null itersection of _itemHierarchy[_istemHierarchy.length-1] and portfolioProjectsInWorkspace - unique project w/user stories
     },
     getRallyPerspective: function() {
       // if hasIterations()
       //   getParentPortfolioProject
       // else
       //   getProjectsInPortfolio
       // set projectQueue[data] = project oid w/user stories
     },
     //
     //Get Portfolio Projects
     //
     getPortfolioProjectsInWorkspace: function()  {
             var dfr = Ext.create('Deft.Deferred');
             Ext.create('Rally.data.lookback.SnapshotStore', {
                             limit: Infinity,
                             fetch: ['ObjectID', 'c_SonarURL', 'c_SonarProject'],
                             filters: [
                                     {
                                         property: "__At",
                                         value : "current"
                                     },
                                     {
                                        property: '_TypeHierarchy',
                                         operator: '$in',
                                         value: ["PortfolioItem/Project"]
                                     }
                                 ],
                         }).load({
                             params: { compress:true, removeUnauthorizedSnapshots: true },
                             callback : function(records, operation, success) {
                                var projects = new Array();
                                if (operation.wasSuccessful()) {
                                       for (var i = 0; i < records.length; i++) {
                                           projects[records[i].data.ObjectID] = records[i].data;
                                       }
                                       dfr.resolve(projects);
                                 } else {
                                      dfr.reject();
                                 }
                             }
                         });
             return dfr.promise;
     },
     //
     // Get UserStories Hierarchy
     //
     getHierarchicalRequirements: function()  {
            var dfr = Ext.create('Deft.Deferred');
            Ext.create('Rally.data.lookback.SnapshotStore', {
                limit: Infinity,
                fetch: ['Name', 'ObjectID', 'Parent', 'Project', '_TypeHierarchy', 'Children', '_ItemHierarchy', 'PortfolioItem' ],
                hydrate: ['_TypeHierarchy', 'Children', 'Project', '_ItemHierarchy', 'PortfolioItem'],
                filters: [
                        {
                            property: "__At",
                            value : "current"
                        },
                        {
                           property: '_TypeHierarchy',
                            operator: '$in',
                            value: ["HierarchicalRequirement"]
                        }
                    ],
                    context : {
                            workspace : Rally.environment.getContext().getWorkspace(),
                            project : Rally.environment.getContext().getProject(),
                            projectScopeUp : true,
                            projectScopeDown : true
                   }
            }).load({
                params: { compress:true, removeUnauthorizedSnapshots: true },
                callback : function(records, operation, success) {
                   if (operation.wasSuccessful()) {
                       var tempArray = new Array();
                       var ind = 0;
                           for (i=0; i < records.length; i++) {
                              for (var j = 0; j < records[i].data._ItemHierarchy.length; j++) {
                                 if (records[i].data.Project.Name === Rally.environment.getContext().getProject().Name &&
                                     tempArray.indexOf(records[i].data._ItemHierarchy[j]) === -1) {
                                         tempArray[ind] = records[i].data._ItemHierarchy[j];
                                         ind++;
                                 }
                              }
                           }
                           dfr.resolve(tempArray);
                     } else {
                         dfr.reject();
                    }
                }
            });
            return dfr.promise;
      },
      //
      // Return sprints for a specific Rally project, defaults to the currently viewed project.
      //
     getObject: function(oid)  {
             var dfr = Ext.create('Deft.Deferred');
             var sprints = new Array();

             //if ((typeof projName === 'undefined' || projName === "") && Rally.environment.getContext !== null) {
             //    projName = Rally.environment.getContext().getProject().Name;
             //}

             var objectFilter = Ext.create('Rally.data.wsapi.Filter', {
                     property : 'ObjectID',
                     operator : '=',
                     value : oid
             });

             Ext.create('Rally.data.wsapi.Store', {
                 model: 'Artifact',
                 fetch: ['Name', 'ObjectID', 'StartDate', 'EndDate', 'Project', 'PortfolioItemType'],
                 context : {
                     workspace : Rally.environment.getContext().getWorkspace(),
                     //project : Rally.environment.getContext().getProject(),
                     project : null,
                     projectScopeUp : true,
                     projectScopeDown : true

                 //    project : null
                 },
                 autoLoad: true,
                 async: false
             }).load({
                 callback : function(records, operation, success) {
                     if (operation.wasSuccessful()) {
                           for (i=0; i < records.length; i++) {
                               sprints[records[i].data.Name] = records[i];
                           }
                           dfr.resolve(sprints);
                     } else {
                          dfr.reject();
                     }
                 }
             });
             return dfr.promise;
     },
     //
     // Return sprints for a specific Rally project, defaults to the currently viewed project.
     //
	 getSprintDataStore: function(projName)  {
            var dfr = Ext.create('Deft.Deferred');
            var sprints = new Array();

            if ((typeof projName === 'undefined' || projName === "") && Rally.environment.getContext !== null) {
                projName = Rally.environment.getContext().getProject().Name;
            }

            var projFilter = Ext.create('Rally.data.wsapi.Filter', {
                    property : 'Project.Name',
                    operator : '=',
                    value : projName
            });

            Ext.create('Rally.data.wsapi.Store', {
                model: 'Iteration',
                fetch: ['Name', 'ObjectID', 'StartDate', 'EndDate', 'Project'],
                context : {
                    project : null
                },
                filters: projFilter,
                autoLoad: true,
                async: false
            }).load({
                callback : function(records, operation, success) {
                    if (operation.wasSuccessful()) {
                          for (i=0; i < records.length; i++) {
                              sprints[records[i].data.Name] = records[i];
                          }
                          dfr.resolve(sprints);
                    } else {
                         dfr.reject();
                    }
                }
            });
            return dfr.promise;
	 },
    //
    // Return defects for a specific Rally project, defaults to the currently viewed project.
    //
    getDefectDataStore: function(projName)  {
            var dfr = Ext.create('Deft.Deferred');
            var defects = new Array();

            if ((typeof projName === 'undefined' || projName === "") && Rally.environment.getContext !== null) {
                projName = Rally.environment.getContext().getProject().Name;
            }

            var projFilter = Ext.create('Rally.data.wsapi.Filter', {
                    property : 'Project.Name',
                    operator : '=',
                    value : projName
            });

            Ext.create('Rally.data.wsapi.Store', {
                model: 'Defect',
                fetch: ['Name', 'ObjectID', 'State', 'CreationDate', 'ClosedDate', 'Severity', 'Iteration', 'Project'],
                context : {
                    project : null
                },
                filters: projFilter,
                autoLoad: true,
                async: false
            }).load({
                callback : function(records, operation, success) {
                    if (operation.wasSuccessful()) {
                         for (i=0; i < records.length; i++) {
                            defects[records[i].data.Name] = records[i];
                         }
                         dfr.resolve(defects);
                    } else {
                         dfr.reject();
                    }
                }
            });
            return dfr.promise;
	 },
}

 
