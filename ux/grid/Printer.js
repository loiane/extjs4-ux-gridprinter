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
 * Ext.ux.grid.Printer.print(grid);
 * 
 * Original url: http://edspencer.net/2009/07/printing-grids-with-ext-js.html
 * 
 * Modified by Loiane Groner (me@loiane.com) - September 2011 - Ported to Ext JS 4
 * http://loianegroner.com (English)
 * http://loiane.com (Portuguese)
 */
Ext.define("Ext.ux.grid.Printer", {
	
	requires: 'Ext.XTemplate',

	statics: {
		/**
		 * Prints the passed grid. Reflects on the grid's column model to build a table, and fills it using the store
		 * @param {Ext.grid.Panel} grid The grid to print
		 */
		print: function(grid) {
			//We generate an XTemplate here by using 2 intermediary XTemplates - one to create the header,
			//the other to create the body (see the escaped {} below)
			var columns = grid.columns;

			//build a useable array of store data for the XTemplate
			var data = [];
			grid.store.data.each(function(item) {
				var convertedData = [];

				//apply renderers from column model
				for (var key in item.data) {
					var value = item.data[key];

					Ext.each(columns, function(column) {
						if (column.dataIndex == key) {
							convertedData[key] = column.renderer ? column.renderer(value) : value;
						}
					}, this);
				}

				data.push(convertedData);
			});

			//use the headerTpl and bodyTpl markups to create the main XTemplate below
			var headings = Ext.create('Ext.XTemplate', this.headerTpl).apply(columns);
			var body     = Ext.create('Ext.XTemplate', this.bodyTpl).apply(columns);
			
			var htmlMarkup = [
				'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
				'<html>',
				  '<head>',
				    '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
				    '<link href="' + this.stylesheetPath + '" rel="stylesheet" type="text/css" media="screen,print" />',
				    '<title>' + grid.title + '</title>',
				  '</head>',
				  '<body>',
				    '<table>',
				      headings,
				      '<tpl for=".">',
				        body,
				      '</tpl>',
				    '</table>',
				  '</body>',
				'</html>'           
			];

			var html = Ext.create('Ext.XTemplate', htmlMarkup).apply(data); 

			//open up a new printing window, write to it, print it and close
			var win = window.open('', 'printgrid');

			win.document.write(html);

			if (this.printAutomatically){
				win.print();
				win.close();
			}
		},

		/**
		 * @property stylesheetPath
		 * @type String
		 * The path at which the print stylesheet can be found (defaults to 'ux/grid/gridPrinterCss/print.css')
		 */
		stylesheetPath: 'ux/grid/gridPrinterCss/print.css',
		
		/**
		 * @property printAutomatically
		 * @type Boolean
		 * True to open the print dialog automatically and close the window after printing. False to simply open the print version
		 * of the grid (defaults to true)
		 */
		printAutomatically: true,
		
		/**
		 * @property headerTpl
		 * @type {Object/Array} values
		 * The markup used to create the headings row. By default this just uses <th> elements, override to provide your own
		 */
		headerTpl: [ 
			'<tr>',
				'<tpl for=".">',
					'<th>{text}</th>',
				'</tpl>',
			'</tr>'
		],

		/**
		 * @property bodyTpl
		 * @type {Object/Array} values
		 * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
		 * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
		 */
		bodyTpl: [
			'<tr>',
				'<tpl for=".">',
					'<td>\{{dataIndex}\}</td>',
				'</tpl>',
			'</tr>'
		]
	}
});