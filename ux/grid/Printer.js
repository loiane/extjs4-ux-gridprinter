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
 * Modified by Paulo D.G. (my classmate of the job) - Março 2012
 * 
 * Modified by Beto Lima - March 2012 - Ported to Ext JS 4
 * 
 * Modified by Beto Lima - 2012-04-02 - Ported to Ext JS 4
 * 
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
            grid.store.data.each(function(item, row) {
                var convertedData = [];

                //apply renderers from column model
                for (var key in item.data) {
                    var value = item.data[key];

                    Ext.each(columns, function(column, col) {
                        if (column.dataIndex == key) {
                             /*
                             * TODO: add the meta to template
                             */
                            var meta = {item: '', tdAttr: '', style: ''};
                            convertedData[key] = column.renderer ? column.renderer.call(grid, value, meta, item, row, col, grid.store, grid.view) : value;
                        }
                    }, this);
                }

                data.push(convertedData);
            });
            
            //remove columns that do not contains dataIndex or dataIndex is empty. for example: columns filter or columns button
            var clearColumns = [];
            Ext.each(columns, function (column) {
                if (column.dataIndex != "") {
                    clearColumns.push(column);
                }
            });
            columns = clearColumns;

            //use the headerTpl and bodyTpl markups to create the main XTemplate below
            var headings = Ext.create('Ext.XTemplate', this.headerTpl).apply(columns);
            var body     = Ext.create('Ext.XTemplate', this.bodyTpl).apply(columns);
            
            //Button print and close at the page (optional)
            var btnPrint = '<button type="button" onclick="javascript:window.location.reload(true);window.print(true);">Print</button> <button type="button" onclick="javascript:window.close();">Close</button><hr />';
            
            //Here because inline styles using CSS, the browser did not show the correct formatting of the data the first time that loaded
            var stylesInLine = 
                    'html,body,div,dl,dt,dd,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,form,fieldset,input,p,blockquote,th,td{margin:0;padding:0;}' +
                    'img,body,html{border:0;margin:10px}' +
                    'address,caption,cite,code,dfn,em,strong,th,var{font-style:normal;font-weight:normal;}' +
                    'ol,ul {list-style:none;}caption,th {text-align:left;}h1,h2,h3,h4,h5,h6{font-size:100%;}q:before,q:after{content:"";}' +
                    'table {' +
                    '  width: 100%;' +
                    '  text-align: left;' +
                    '  font-size: 11px;' +
                    '  font-family: arial;' +
                    '  border-collapse: collapse;' +
                    '}' +
                    'table th {' +
                    '  padding: 4px 3px 4px 5px;' +
                    '  border: 1px solid #d0d0d0;' +
                    '  border-left-color: #eee;' +
                    '  background-color: #ededed;' +
                    '}' +
                    'table td {' +
                    '  padding: 4px 3px 4px 5px;' +
                    '  border-style: none solid solid;' +
                    '  border-width: 1px;' +
                    '  border-color: #ededed;' +
                    '}' +
                    '@media print{@page {size: landscape};#noprint{display:none;}body{background:#fff;}}';
            
            var htmlMarkup = [
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
                '<html>',
                  '<head>',
                    '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
                    '<style type="text/css">',
                        stylesInLine,
                    '</style>',
                    '<title>' + grid.title + '</title>',
                  '</head>',
                  '<body>',
                  '<div id="noprint">' + btnPrint + '</div>',
                  '<div>' + this.mainTitle + '</div>',
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
            // use: window.open('') if you want to always open in a new window
            var win = window.open('', 'printgrid');
            
            //fixed the problem that every call to print, the content is duplicated on the page.
            win.document.body.innerHTML = "";

            win.document.write(html);
            
            //force stop the document
            //fixed the problem where the page stayed loading without stop the content already downloaded with the screen.
            if(win.stop !== undefined) {
                 //Mozilla
                 win.stop();
            } else if(document.execCommand !== undefined) {
                 //Internet Explorer
                 window.document.execCommand('Stop');
            }            

            //An attempt to correct the print command to the IE browser
            if (this.printAutomatically){
                if(Ext.isIE){
                    window.print();
                } else {
                    win.print();
                }
            }
            
            //Another way to set the closing of the main
            if (this.closeAutomaticallyAfterPrint){
                if(Ext.isIE){
                    window.close();
                } else {
                    win.close();
                }                
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
         * @property mainTitle
         * @type String
         * Title to be used on top of the table
         * (defaults to empty)
         */
        mainTitle: '',        
        
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