/**
 * @class Ext.ux.grid.Printer
 * @author Ed Spencer (edward@domine.co.uk)
 * Helper class to easily print the contents of a grid. Will open a new window with a table where the first row
 * contains the headings from your column model, and with a row for each item in your grid's store. When formatted
 * with appropriate CSS it should look very similar to a default grid. If renderers are specified in your column
 * model, they will be used in creating the table. Override headerTpl and bodyTpl to change how the markup is generated
 * 
 * Usage:
 * 
 * 1 - Add Ext.Require Before the Grid code
 * Ext.require([
 *   'Ext.ux.grid.GridPrinter',
 * ]);
 * 
 * 2 - Declare the Grid 
 * var grid = Ext.create('Ext.grid.Panel', {
 *   columns: //some column model,
 *   store   : //some store
 * });
 * 
 * 3 - Print!
 * Ext.ux.grid.Printer.mainTitle = 'Your Title here'; //optional
 * Ext.ux.grid.Printer.print(grid);
 * 
 * Original url: http://edspencer.net/2009/07/printing-grids-with-ext-js.html
 * 
 * Modified by Loiane Groner (me@loiane.com) - September 2011 - Ported to Ext JS 4
 * http://loianegroner.com (English)
 * http://loiane.com (Portuguese)
 * 
 * Modified by Bruno Sales - August 2012
 * 
 * Modified by Paulo Goncalves - March 2012
 * 
 * Modified by Beto Lima - March 2012
 * 
 * Modified by Beto Lima - April 2012
 *
 * Modified by Paulo Goncalves - May 2012
 * 
 * Modified by Nielsen Teixeira - 2012-05-02
 *
 * Modified by Joshua Bradley - 2012-06-01
 * 
 * Modified by Loiane Groner - 2012-09-08
 * 
 * Modified by Loiane Groner - 2012-09-24 
 *
 * Modified by Loiane Groner - 2012-10-17
 * FelipeBR contribution: Fixed: support for column name that contains numbers
 * Fixed: added support for template columns
 *
 * Modified by Loiane Groner - 2013-Feb-26
 * Fixed: added support for row expander plugin
 * Tested using Ext JS 4.1.2
 *
 * Modified by Steven Ervin - 2013-Sep-18
 * Added support for summary and groupingsummary features
 * Aligned columns according to grid column's alignment setting.
 * Updated to use columnManager to recognize grid reconfiguration
 * changes under 4.2.1.
 * 
 * Modified by Steven Ervin - 2013-Oct-24
 * Added support for using the MetaData object to style the output.
 * Added support for Server generated summaries.
 *
 * Modified by Alexandr Arzamastsev - 2013-Nov-20
 * Set printLinkText and closeLinkText as params
 * Added param for page title.
 */
Ext.define("Ext.ux.grid.Printer", {
    
    requires: 'Ext.XTemplate',

    statics: {
        /**
         * Prints the passed grid. Reflects on the grid's column model to build a table, and fills it using the store
         * @param {Ext.grid.Panel} grid The grid to print
         */
        print: function(grid, featureId) {
        	
        	//featureId is no longer needed and is ignored 
        	
            // We generate an XTemplate here by using 2 intermediary
            // XTemplates - one to create the header, the other
            // to create the body (see the escaped {} below)
            var isGrouped = grid.store.isGrouped ? grid.store.isGrouped() : false;
            var groupField;
            if ( isGrouped ) {
                //var feature = this.getFeature( grid, featureId );
                var feature = this.getFeature( grid, 'grouping' );
                if (feature)
                	groupField = feature.getGroupField();
                else
                	isGrouped = false;  // isGrouped turned off if grouping feature not defined
            }
            if (grid.columnManager)
            {
            	// use the column manager to get the columns.
               //var columns = grid.columnManager.getColumns(); // Not supported in ExtJS-4.1.x
            	var columns = grid.view.headerCt.getVisibleGridColumns();

            }
            else
            {
                //account for grouped columns
                var columns = [];
                Ext.each(grid.columns, function(c) {
                    if(c.items && c.items.length > 0) {
                        columns = columns.concat(c.items.items);
                    } else {
                        columns.push(c);
                    }
                });
            }

            //build a usable array of store data for the XTemplate
            var data = [];
//          //This code is no longer needed
//            grid.store.data.each(function(item, row) {
//                var convertedData = {};
//
//                //apply renderers from column model
//                for (var key in item.data) {
//                    var value = item.data[key];
//                    var found = false;
//
//                    Ext.each(columns, function(column, col) {
//                        
//                        if (column && column.dataIndex == key) {
//                            var meta = { 'align'            : column.align,
//                            			 'cellIndex'        : col,
//                            			 'classes'          : [],
//                            			 'column'           : column,
//                            			 'innerCls'         : '',
//                            			 'record'           : item,
//                            			 'recordIndex'      : grid.store.indexOf(item),
//                            			 'style'            : '',
//                            			 'tdAttr'           : '',
//                            			 'tdCls'            : '',
//                            			 'unselectableAttr' : 'unselectable="on"',
//                            			 'value'            : value
//                                       };
//                            value = column.renderer ? column.renderer.call(grid, value, meta, item, row, col, grid.store, grid.view) : value;
//                            var varName = Ext.String.createVarName(column.dataIndex);
//                            convertedData[varName] = value;
//                            found = true;
//                            
//                        } else if (column && column.xtype === 'rownumberer'){
//                            
//                            var varName = Ext.String.createVarName(column.id);
//                            convertedData[varName] = (row + 1);
//                            found = true;
//                            
//                        } else if (column && column.xtype === 'templatecolumn'){
//                            
//                            value = column.tpl ? column.tpl.apply(item.data) : value;
//                            
//                            var varName = Ext.String.createVarName(column.id);
//                            convertedData[varName] = value;
//                            found = true;
//                            
//                        } 
//                    }, this);
//
//                    if (!found) { // model field not used on Grid Column, can be used on RowExpander
//                        var varName = Ext.String.createVarName(key);
//                        convertedData[varName] = value;
//                    }
//                }
//
//                data.push(convertedData);
//            });
            
            // remove columns that do not contain dataIndex
            // or dataIndex is empty.
            // for example: columns filter or columns button
            var clearColumns = [];
            Ext.each(
                columns,
                function (column) {
                    if ( column ) {
                        if ( !Ext.isEmpty(column.dataIndex) &&
                             !column.hidden                 &&
                             !isGrouped )
                        {
                            clearColumns.push(column);
                        } else if ( column.xtype === 'rownumberer'){
                            if (!column.text) column.text = 'Row';
                            clearColumns.push(column);
                        } else if ( column.xtype === 'templatecolumn'){
                            clearColumns.push(column);
                        } else if ( isGrouped && 
                                    column.dataIndex !== groupField &&
                                    column.xtype !== 'actioncolumn'){
                            clearColumns.push(column);
                        }
                    }
                }
            );
            columns = clearColumns;
            
            //get Styles file relative location, if not supplied
            if (this.stylesheetPath === null) {
                var scriptPath = Ext.Loader.getPath('Ext.ux.grid.Printer');
                this.stylesheetPath = scriptPath.substring(0, scriptPath.indexOf('Printer.js')) + 'gridPrinterCss/print.css';
            }

            //use the headerTpl and bodyTpl markups to create the main XTemplate below
            var headings = Ext.create('Ext.XTemplate', this.headerTpl).apply(columns);
            var body     = this.generateBody( grid, columns, feature );
            var expanderTemplate,
                pluginsBodyMarkup = [];
            
            //add relevant plugins
            Ext.each(grid.plugins, function(p) {
                if (p.ptype == 'rowexpander') {
                    expanderTemplate = p.rowBodyTpl;
                }
            });
            
            if (expanderTemplate) 
            {
                pluginsBodyMarkup = [
                    '<tr class="{[xindex % 2 === 0 ? "even" : "odd"]}"><td colspan="' + columns.length + '">',
                        '{[ this.applyTpl(values) ]}',
                    '</td></tr>'
                ];
            }
            
            var title = (grid.title) ? grid.title : this.pageTitle;
            var summaryFeature = this.getFeature(grid, 'summary');

            //Here because inline styles using CSS, the browser did not show the correct formatting of the data the first time that loaded
            var htmlMarkup = [
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
                '<html class="' + Ext.baseCSSPrefix + 'ux-grid-printer">',
                  '<head>',
                    '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
                    '<link href="' + this.stylesheetPath + '" rel="stylesheet" type="text/css" />',
                    '<title>' + title + '</title>',
                    '<script type="text/javascript">',
    	        	  'function printOnload() {["{"]}',
    	                'if (' + this.printAutomatically + ') {["{"]}',
    	                  'window.print();',
    	                  'if (' + this.closeAutomaticallyAfterPrint + ') {["{"]}',
    	                    'window.close();',
    	                  '{["}"]}',
    	                '{["}"]}',
    	              '{["}"]}',
    	            '</script>',
                  '</head>',
                  '<body class="' + Ext.baseCSSPrefix + 'ux-grid-printer-body" onload="printOnload();">',
                  '<div class="' + Ext.baseCSSPrefix + 'ux-grid-printer-noprint ' + Ext.baseCSSPrefix + 'ux-grid-printer-links">',
                      '<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkprint" href="javascript:void(0);" onclick="window.print();">' + this.printLinkText + '</a>',
                      '<a class="' + Ext.baseCSSPrefix + 'ux-grid-printer-linkclose" href="javascript:void(0);" onclick="window.close();">' + this.closeLinkText + '</a>',
                  '</div>',
                  '<h1>' + this.mainTitle + '</h1>',
                    '<table>',
                      '<tr>',
                        headings,
                      '</tr>',
                        '<tpl for=".">',
                           '<tr class="{[xindex % 2 === 0 ? "even" : "odd"]}">',
                              body,
                           '</tr>',
                           pluginsBodyMarkup.join(''),
                           '{% if (this.isGrouped && xindex > 0) break; %}',
                        '</tpl>',
                        '<tpl if="this.hasSummary">',
                            '<tr>',
                        	'<tpl for="this.columns">',
                        		'{[ this.renderSummary(values, xindex) ]}',
                        	'</tpl>',
                        	'</tr>',
                        '</tpl>',
                    '</table>',
                  '</body>',
                '</html>',
                {
                    isGrouped              : isGrouped,
                    grid                   : grid,
              	     columns                : columns,
                    hasSummary             : Ext.isObject(summaryFeature),
              	     summaryFeature         : summaryFeature,
                    expanderTemplate       : expanderTemplate,
                    renderColumn: function(column, value, rcd, col)
                    {
                    	var meta = { 'align'            : column.align,
                                  'cellIndex'        : col,
                                  'classes'          : [],
                                  'column'           : column,
                                  'css'              : '',
                                  'innerCls'         : '',
                                  'record'           : rcd,
                                  'recordIndex'      : grid.store.indexOf ? grid.store.indexOf(rcd) : undefined,
                                  'style'            : '',
                                  'tdAttr'           : '',
                                  'tdCls'            : '',
                                  'unselectableAttr' : 'unselectable="on"',
                                  'value'            : value
                           	  };
                    	if (column.xtype == 'templatecolumn')
                    	{
                    		value = column.tpl ? column.tpl.apply(rcd.data) : value;
                    	}
                    	else if (column.renderer) {
                            if (column instanceof Ext.tree.Column) {
                                value = column.renderer.call(column, value, meta, rcd, -1, col - 1, this.grid.store, this.grid.view);
                            } else {
                                value = column.renderer.call(this.grid, value, meta, rcd, -1, col - 1, this.grid.store, this.grid.view);
                            }
                        }

                    	return this.getHtml(value, meta);
                    },
                    applyTpl: function(rcd)
                    {
                       var html = this.expanderTemplate.apply(rcd.data); 
                       
                       return html;
                    },
             		renderSummary: function(column, colIndex)
              		{
              			var value;
              			if (this.summaryFeature.remoteRoot)
              			{
              				var summaryRecord = this.summaryFeature.summaryRecord || (new this.grid.view.store.model(null, this.grid.view.id + '-summary-record'));
              				if (this.grid.view.store.proxy.reader.rawData) 
              				{
              	            	if (Ext.isArray(this.grid.view.store.proxy.reader.rawData[this.summaryFeature.remoteRoot]))
              	            		summaryRecord.set(this.grid.view.store.proxy.reader.rawData[this.summaryFeature.remoteRoot][0]);
              	            	else
              	            		summaryRecord.set(this.grid.view.store.proxy.reader.rawData[this.summaryFeature.remoteRoot]);
              	            }
              				value = summaryRecord.get(column.dataIndex);
              			}
              			else
              			{
              				value = this.getSummary(this.grid.store, column.summaryType, column.dataIndex, false);
              			}
              			
              			if (column.summaryRenderer)
              			{
              				var summaryObject;
                    		if (Ext.getVersion().isLessThan('4.2.0'))
                    		{
                    			summaryObject = this.getSummaryObject(column.align);
                    			value = column.summaryRenderer.call(column, value, summaryObject, column.dataIndex);
                    			return this.getHtml(value, summaryObject);
                    		}
                    		else
                    		{
                    			var summaryRcd = this.getSummaryRecord42();
                    			var summaryObject = this.getSummaryObject42(value, column, colIndex, summaryRcd);
                    			value = column.summaryRenderer.call(this.grid, 
                    					                           value, 
                    					                           summaryObject, 
                    					                           summaryRcd,
                    					                           -1,
                    					                           colIndex,
                    					                           this.grid.store,
                    					                           this.grid.view); 
                    			
                    			return this.getHtml(value, summaryObject);
                    		}
              			}
              			else
              			{
              				var meta = this.getSummaryObject42(column, colIndex);
              				if (value === undefined || value == 0)
              					return this.getHtml("&nbsp;", meta);
              				else
              					return this.getHtml(value, meta);
              			}
              		},
              		getSummaryObject: function(align)
                    {      
              			var summaryValues = {};
                   		for (var i = 0; i < columns.length; i++)
                   		{
                   			var valueObject = this.getSummary(this.grid.store, this.columns[i].summaryType, this.columns[i].dataIndex, false);
                   			if (valueObject === undefined)
                   				continue; // Do nothing
                   			else
                   				summaryValues[columns[i].id] = valueObject;
                   		}
                   		summaryValues['style'] = "text-align:" + align + ';';
                   		return summaryValues;
                   },
                   getSummaryRecord42: function()
                   {
             			if (this.summaryFeature.remoteRoot)
              			{
              				var summaryRecord = this.summaryFeature.summaryRecord || (new this.grid.view.store.model(null, this.grid.view.id + '-summary-record'));
              				if (this.grid.view.store.proxy.reader.rawData) 
              				{
              	            	if (Ext.isArray(this.grid.view.store.proxy.reader.rawData[this.summaryFeature.remoteRoot]))
              	            		summaryRecord.set(this.grid.view.store.proxy.reader.rawData[this.summaryFeature.remoteRoot][0]);
              	            	else
              	            		summaryRecord.set(this.grid.view.store.proxy.reader.rawData[this.summaryFeature.remoteRoot]);
              	            }
              				return summaryRecord;
              			}

                   		var rcd = Ext.create(this.grid.store.model);
                   		for (var i = 0; i < this.columns.length; i++)
                   		{
                   			var	valueObject = this.getSummary(this.grid.store, this.columns[i].summaryType, this.columns[i].dataIndex, false);
                   			if (valueObject === undefined)
                   				continue; // Do nothing
                   			else
                   				rcd.set(this.columns[i].dataIndex, valueObject);
                   		}
                   		return rcd;
                   },
                   getSummaryObject42: function(value, column, colIndex, rcd)
                   {
                   		return { align            : column.align,
                   			      cellIndex        : colIndex,
                   			      'column'         : column,
                   			      classes          : [],
                   			      css              : '',
                   			      innerCls         : '',
                   			      record           : rcd,
                   			      recordIndex      : -1,
                   			      style            : '',
                   			      tdAttr           : '',
                   			      tdCls            : '',
                   			      unselectableAttr : 'unselectable="on"',
                   			      'value'          : value
                   			   };
                   },
                   // Use the getSummary from Ext 4.1.3.  This function for 4.2.1 has been changed without updating the documentation
                   // In 4.2.1, group is a group object from the store (specifically grid.store.groups[i].items).
                   /**
                    * Get the summary data for a field.
                    * @private
                    * @param {Ext.data.Store} store The store to get the data from
                    * @param {String/Function} type The type of aggregation. If a function is specified it will
                    * be passed to the stores aggregate function.
                    * @param {String} field The field to aggregate on
                    * @param {Boolean} group True to aggregate in grouped mode 
                    * @return {Number/String/Object} See the return type for the store functions.
                    */
                   getSummary: function(store, type, field, group)
                   {
                       if (type) 
                       {
                           if (Ext.isFunction(type)) 
                           {
                               return store.aggregate(type, null, group, [field]);
                           }

                           switch (type) 
                           {
                               case 'count':
                                   return store.count(group);
                               case 'min':
                                   return store.min(field, group);
                               case 'max':
                                   return store.max(field, group);
                               case 'sum':
                                   return store.sum(field, group);
                               case 'average':
                                   return store.average(field, group);
                               default:
                                   return group ? {} : '';              
                           }
                       }
                   },
                   getHtml: function(value, meta)
                   {
                	   if (value == undefined)
                   			value = '&nbsp;';
                   	
                  	var html = '<td ';
                  	var tdClasses = '';
                  	if (meta.tdCls)
                  		tdClasses = meta.tdCls;
               		if (meta.css)
                			if (tdClasses.length > 0)
                				tdClasses += " " + meta.css;
                			else
                				tdClasses = meta.css;
                		if (tdClasses.length > 0)
                			html += 'class="' + tdClasses + '"';
                  	if (meta.tdAttr)
                  		html += ' ' + meta.tdAttr;
                  	html += '><div ';
                  	if (meta.innerCls)
                  		html += 'class="' + meta.innerCls + '"';
                  	html += ' style="text-align: ' + meta.align + ';';
                  	if (meta.style)
                  		html += meta.style;
                  	html += '" ';
                  	if (meta.unselectableAttr)
                  		html += meta.unselectableAttr;
                  	html += '>' + value + '</div></td>';
                   	
                   		return html;
                   }
                }
            ];

//            var html = Ext.create('Ext.XTemplate', htmlMarkup).apply(data);
            var records;
            if (grid.store instanceof Ext.data.TreeStore) {
                records = [];
                grid.store.getRootNode().cascadeBy(function(node) {
               	 if (node.isRoot() && !grid.rootVisible) return;
               	 if (!node.isVisible()) return;
               	 records.push(node);
                }, this);
            } else {
                records = grid.store.getRange();
            }
            var html = Ext.create('Ext.XTemplate', htmlMarkup).apply(records); 

            //open up a new printing window, write to it, print it and close
            var win = window.open('', 'printgrid');
            
            //document must be open and closed
            win.document.open();
            win.document.write(html);
            win.document.close();
            
            // Not needed.  Auto-printing handled in htmlMarkup XTemplate.
//            if (this.printAutomatically){
//                win.print();
//            }
//            
//            //Another way to set the closing of the main
//            if (this.closeAutomaticallyAfterPrint){
//                if(Ext.isIE){
//                    window.close();
//                } else {
//                    win.close();
//                }                
//            }
        },

//        getFeature : function( grid, featureId ) {
//            var feature;
//            var view     = grid.getView();
//            if ( featureId ) {
//                feature = view.getFeature( featureId );
//            }
//            else {
//                var features = view.features;
//                if ( features.length > 1 ) {
//                    alert( "More than one feature requires to pass " +
//                           "featureId as parameter to 'print'." );
//                    return;
//                }
//                else {
//                    feature = features[0];
//                }
//            }
//            return feature;
//        },
        
        getFeature : function( grid, featureFType) 
        {
      	  var view = grid.getView();
       
      	  var features;
      	  if (view.features)
      		  features = view.features;
      	  else if (view.featuresMC)
      		  features = view.featuresMC.items;
      	  else if (view.normalView.featuresMC)
      		  features = view.normalView.featuresMC.items;
      	  
      	  if (features)
        		for (var i = 0; i <features.length; i++)
        		{
        			if (featureFType == 'grouping')
        				if (features[i].ftype == 'grouping' || features[i].ftype == 'groupingsummary')
        					return features[i];
        			if (featureFType == 'groupingsummary')
        				if (features[i].ftype == 'groupingsummary')
        					return features[i];        				
        			if (featureFType == 'summary')
        				if (features[i].ftype == 'summary')
        					return features[i];        				
        		}
        	return undefined;
        },

        generateBody : function( grid, columns, feature ) 
        {
            var groups   = [];
            var fields   = grid.store.getProxy().getModel().getFields();
            var hideGroupField = true;
            var groupField;
            var body;
            var groupingSummaryFeature = this.getFeature(grid, 'groupingsummary');

            if (grid instanceof Ext.grid.Panel) {
                groups = grid.store.getGroups();
            }

            
            //if (groups.length && grid.store.isGrouped() && feature )
            if (grid.store.isGrouped() && groups && groups.length && feature )
            {
                hideGroupField = feature.hideGroupedHeader;  // bool
                groupField = feature.getGroupField();
                
                var groupColumn;
                Ext.each(grid.columns, function(col)
               	{
                	if (col.dataIndex == groupField)
                		groupColumn = col;
               	});

                if ( !feature || !fields || !groupField ) {
                    return;
                }
                    
                if ( hideGroupField ) {
                    var removeGroupField = function( item ) {
                        return ( item.name != groupField );
                    };
                    // Remove group field from fields array.
                    // This could be done later in the template,
                    // but it is easier to do it here.
                    fields = fields.filter( removeGroupField );
                }

                // Use group header template for the header.
                var html = feature.groupHeaderTpl.html || '';
                
                // #$%! ExtJS 5.x changed the output of getGroups().  It is now an Ext.util.GroupCollection object.
                // We need to transform it back into the 4.x structure which our template expects.
                if (Ext.getVersion().isGreaterThanOrEqual('5.0.0'))
                {
               	 var newGroups = [];
               	 for (var i = 0; i < groups.getCount(); i++)
               	 {
               		 var groupObj = groups.getAt(i);
               		 newGroups.push({
               			 name: groupObj.getGroupKey(),
               		    children: groupObj.getRange()
               		 });
               	 }
               	 groups = newGroups;
                }

                var bodyTpl = [
                    '<tpl for=".">',
                        '<tr class="group-header">',
                            '<td colspan="{[this.colSpan]}">',
                              '{[ this.applyGroupTpl(values) ]}',
                            '</td>',
                        '</tr>', 
                        '<tpl for="children">',
                            '<tr class="{[xindex % 2 === 0 ? "even" : "odd"]}">',
                                '<tpl for="this.columns">',
                                    '{[ this.renderColumn(values, parent.get(values.dataIndex), parent, xindex) ]}',
                                '</tpl>',
                            '</tr>',
                        '</tpl>',
                        '<tpl if="this.hasSummary">',
                           '<tr>',
                           '<tpl for="this.columns">',
                              '{[ this.renderSummary(values, xindex) ]}',
                           '</tpl>',
                           '</tr>',
                        '</tpl>',
                    '</tpl>',
                    {
                        // XTemplate configuration:
                        columns               : columns,
                        groupColumn           : groupColumn,
                        colSpan               : columns.length,
                        grid                  : grid,
                        groupName             : "",
                        groupTpl              : feature.groupHeaderTpl,
                        hasSummary            : Ext.isObject(groupingSummaryFeature) && groupingSummaryFeature.showSummaryRow,
                        summaryFeature        : groupingSummaryFeature,
                        // XTemplate member functions:
                        childCount : function(c) {
                            return c.length;
                        },
                        renderColumn: function(column, value, rcd, col)
                        {
                        	var meta = { 'align'            : column.align,
                       			         'cellIndex'        : col,
                       			         'classes'          : [],
                       			         'column'           : column,
                       			         'css'              : '',
                       			         'innerCls'         : '',
                       			         'record'           : rcd,
                       			         'recordIndex'      : grid.store.indexOf(rcd),
                       			         'style'            : '',
                       			         'tdAttr'           : '',
                       			         'tdCls'            : '',
                       			         'unselectableAttr' : 'unselectable="on"',
                       			         'value'            : value
                               		   };
                        	if (column.renderer)
                        		value = column.renderer.call(this.grid, value, meta, rcd, -1, col - 1, this.grid.store, this.grid.view);

                        	return this.getHtml(value, meta);
                        },
                        getHtml: function(value, meta)
                        {
                        	if (value == undefined)
                        		value = '&nbsp;';
                        	
                        	var html = '<td ';
                        	var tdClasses = '';
                        	if (meta.tdCls)
                        		//html += 'class="' + meta.tdCls + '"';
                        		tdClasses = meta.tdCls;
                     		if (meta.css)
                      			if (tdClasses.length > 0)
                      				tdClasses += " " + meta.css;
                      			else
                      				tdClasses = meta.css;
                      		if (tdClasses.length > 0)
                      			html += 'class="' + tdClasses + '"';
                        	if (meta.tdAttr)
                        		html += ' ' + meta.tdAttr;
                        	html += '><div ';
                        	if (meta.innerCls)
                        		html += 'class="' + meta.innerCls + '"';
                        	html += ' style="text-align: ' + meta.align + ';';
                        	if (meta.style)
                        		html += meta.style;
                        	html += '" ';
                        	if (meta.unselectableAttr)
                        		html += meta.unselectableAttr;
                        	html += '>' + value + '</div></td>';
                        	
                        	return html;
                        },
                        renderSummary: function(column, colIndex)
                        {                        	
                        	var value;
                        	var summaryObject;
                  			if (this.summaryFeature.remoteRoot)
                  			{
                  				var summaryRecord = this.summaryFeature.summaryRecord || (new this.grid.view.store.model(null, this.grid.view.id + '-summary-record'));
                  				if (this.grid.view.store.proxy.reader.rawData) 
                  				{
                  	            	if (Ext.isArray(this.grid.view.store.proxy.reader.rawData[this.summaryFeature.remoteRoot]))
                  	            		summaryRecord.set(this.getSummaryRcd(this.grid.view.store.proxy.reader.rawData[this.summaryFeature.remoteRoot], this.grid.store.groupField, this.groupName));
                  	            	else
                  	            		summaryRecord.set(this.grid.view.store.proxy.reader.rawData[this.summaryFeature.remoteRoot]);
                  	            }
                  				value = summaryRecord.get(column.dataIndex);
                  			}
                  			else
                  			{
                  				value = this.getSummary(this.grid.store, column.summaryType, column.dataIndex, this.grid.store.isGrouped());
                  			}
                        	
                        	if (Ext.isObject(value))
                        		value = value[this.groupName];
                        	
                        	if (column.summaryRenderer)
                        		if (Ext.getVersion().isLessThan('4.2.0'))
                        		{
                        			value = column.summaryRenderer.call(column, value, this.getSummaryObject(column.align), column.dataIndex);
                        		}
                        		else
                        		{
                        			summaryObject = this.getSummaryObject42(column, colIndex);
                        			value = column.summaryRenderer.call(this.grid, 
                        					                           value, 
                        					                           this.getSummaryObject42(column, colIndex), 
                        					                           this.getSummaryRecord42(),
                        					                           -1,
                        					                           colIndex,
                        					                           this.grid.store,
                        					                           this.grid.view);

                                	return this.getHtml(value, summaryObject);
                        		}
                        	else
                        		if (value == undefined || value == 0)
                        			value = '&nbsp;';

                        	return '<td><div>' + value + '</div></td>';
                        },
                        applyGroupTpl: function(rcd)
                        {
                        	// The only members in rcd are name and children
                        	this.groupName = rcd.name;
                        	rcd.groupField = this.grid.store.groupField;
                        	
                        	var meta = { 'align'            : '',
                  			             'cellIndex'        : -1,
                  			             'classes'          : [],
                  			             'column'           : this.groupColumn,
                  			             'css'              : '',
                  			             'innerCls'         : '',
                  			             'record'           : rcd.children[0],
                  			             'recordIndex'      : this.grid.store.indexOf(rcd.children[0]),
                  			             'style'            : '',
                  			             'tdAttr'           : '',
                  			             'tdCls'            : '',
                  			             'unselectableAttr' : 'unselectable="on"',
                  			             'value'            : rcd.name
                          		   };

                        	if (this.groupColumn)
                        		rcd.columnName = this.groupColumn.text;
                        	else
                        		rcd.columnName = this.groupField;

                        	rcd.groupValue = rcd.name;

                        	if (this.groupColumn && this.groupColumn.renderer)
                        	{
                        		rcd.renderedGroupValue = this.groupColumn.renderer.call(this.grid, rcd.name, meta, rcd.children[0], -1, -1, this.grid.store, this.grid.view);
                        	}
                        	else
                        		rcd.renderedGroupValue = rcd.name;
                        	//rcd.rows = null;  // We don't support rcd.rows yet
                            return this.groupTpl.apply(rcd); 
                        },
                        getSummaryObject: function(align)
                        {      
                        	var summaryValues = {};
                        	for (var i = 0; i < this.columns.length; i++)
                        	{
                            	var	valueObject = this.getSummary(this.grid.store, this.columns[i].summaryType, this.columns[i].dataIndex, this.grid.store.isGrouped());
                            	if (valueObject === undefined)
                            		continue; // Do nothing
                            	else if (Ext.isObject(valueObject))
                            		summaryValues[columns[i].id] = valueObject[this.groupName];
                            	else
                            		summaryValues[columns[i].id] = valueObject;
                            }
                        	summaryValues['style'] = "text-align:" + align + ';';
                        	return summaryValues;
                        },
                        getSummaryRecord42: function()
                        {
                        	var rcd = Ext.create(this.grid.store.model);
                        	for (var i = 0; i < this.columns.length; i++)
                        	{
                        		var	valueObject = this.getSummary(this.grid.store, this.columns[i].summaryType, this.columns[i].dataIndex, this.grid.store.isGrouped());
                        		if (valueObject === undefined)
                        			continue; // Do nothing
                        		else if (Ext.isObject(valueObject))
                        			rcd.set(this.columns[i].dataIndex, valueObject[this.groupName]);
                        		else
                        			rcd.set(this.columns[i].dataIndex, valueObject);
                        	}
                        	return rcd;
                        },
                        getSummaryObject42: function(column, colIndex)
                        {
                        	return { align            : column.align,
                        			   cellIndex        : colIndex,
                        			   classes          : [],
                        			   css              : '',
                        			   innerCls         : '',
                        			   record           : this.getSummaryRecord42(),
                        			   recordIndex      : -1,
                        			   style            : '',
                        			   tdAttr           : '',
                        			   tdCls            : '',
                        			   unselectableAttr : 'unselectable="on"',
                        			   value            : '&#160;'
                        		    };
                        },
                        // Use the getSummary from Ext 4.1.3.  This function for 4.2.1 has been changed without updating the documentation
                        // In 4.2.1, group is a group object from the store (specifically grid.store.groups[i].items).
                        /**
                         * Get the summary data for a field.
                         * @private
                         * @param {Ext.data.Store} store The store to get the data from
                         * @param {String/Function} type The type of aggregation. If a function is specified it will
                         * be passed to the stores aggregate function.
                         * @param {String} field The field to aggregate on
                         * @param {Boolean} group True to aggregate in grouped mode 
                         * @return {Number/String/Object} See the return type for the store functions.
                         */
                        getSummary: function(store, type, field, group)
                        {
                            if (type) 
                            {
                                if (Ext.isFunction(type)) 
                                {
                                    return store.aggregate(type, null, group, [field]);
                                }

                                switch (type) 
                                {
                                    case 'count':
                                        return store.count(group);
                                    case 'min':
                                        return store.min(field, group);
                                    case 'max':
                                        return store.max(field, group);
                                    case 'sum':
                                        return store.sum(field, group);
                                    case 'average':
                                        return store.average(field, group);
                                    default:
                                        return group ? {} : '';
                                        
                                }
                            }
                        },
                        
                        // return the record having fieldName == value
                        getSummaryRcd : function(rawDataObject, fieldName, value)
                        {
                        	if (Ext.isArray(rawDataObject))
                        	{
                        		for (var i = 0; i < rawDataObject.length; i++)
                        		{
                        			if (rawDataObject[i][fieldName] && rawDataObject[i][fieldName] == value)
                        				return rawDataObject[i];
                        		}
                        		return undefined;
                        	}
                        	else
                        		if (rawDataObject.data[fieldName])
                        			return rawDataObject;
                        		else
                        			return undefined;
                        }
                    }
                ];
                
              body = Ext.create('Ext.XTemplate', bodyTpl).apply(groups);
            }
            else 
            {
                var bodyTpl = [
                          '<tpl for="this.columns">',
                                '{[ this.renderColumn(values, parent.get(values.dataIndex), parent, xindex) ]}',
                          '</tpl>'
                ];

                body = bodyTpl.join('');
            }            

            return body;
        },
        
        /**
         * @property stylesheetPath
         * @type String
         * The path at which the print stylesheet can be found (defaults to 'ux/grid/gridPrinterCss/print.css')
         */
        stylesheetPath: null,
        
        /**
         * @property printAutomatically
         * @type Boolean
         * True to open the print dialog automatically and close the window after printing. False to simply open the print version
         * of the grid (defaults to false)
         */
        printAutomatically: false,
        
        /**
         * @property closeAutomaticallyAfterPrint
         * @type Boolean
         * True to close the window automatically after printing.
         * (defaults to false)
         */
        closeAutomaticallyAfterPrint: false,        
        
		/**
         * @property pageTitle
         * @type String
         * Title to be used on top of the table
         * (defaults to empty)
         */
        pageTitle: 'Print View',
				
        /**
         * @property mainTitle
         * @type String
         * Title to be used on top of the table
         * (defaults to empty)
         */
        mainTitle: '',

         /**
         * Text show on print link
		 * @property printLinkText
         * @type String
         */
        printLinkText: 'Print',
        
        /**
         * Text show on close link
		 * @property closeLinkText
         * @type String
         */
        closeLinkText: 'Close',
        
        /**
         * @property headerTpl
         * @type {Object/Array} values
         * The markup used to create the headings row. By default this just uses <th> elements, override to provide your own
         */
        headerTpl: [ 
            '<tpl for=".">',
                '<th style="text-align: {align}">{text}</th>',
            '</tpl>'
        ],

        /**
         * @property bodyTpl
         * @type {Object/Array} values
         * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
         * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
         */
        bodyTpl: [
            '<tpl for="columns">',
                  '\{\[ this.renderColumn(values, parent.get(values.dataIndex), parent, xindex) \]\}',
            '</tpl>'
        ]

    }
});
