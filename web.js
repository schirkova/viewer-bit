/*******************/    
/* json tree code */    
/*****************/

function convertToTree(d){
		var kids = [];
		for (var key in d) {
			
			var kidData = {};		
  		    if (angular.isArray(d[key]) || angular.isObject(d[key])) 
			{
				kidData["d3DisplayName"] = key  + " : ";
				kidData["children"] = convertToTree(d[key]);	
					
  			}else {
				if (angular.isArray(d)) {
					kidData["d3DisplayName"] =  d[key];
				} else {
					kidData["d3DisplayName"] = key + " : " + JSON.stringify(d[key]);
				} 			
  			}
  			kids.push(kidData);
  			
  		}
  		return kids;
 };

var j3mTree = new Object();

function initTree(jsonData) {
    j3mTree.w = 960,
    j3mTree.h = 6000;
 
    j3mTree.tree = d3.layout.tree()
    .size([j3mTree.h, 200]);

    j3mTree.diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

    j3mTree.vis = d3.select("#chart").append("svg:svg")
    .attr("width", j3mTree.w)
    .attr("height", j3mTree.h)
    .append("svg:g")
    .attr("transform", "translate(20,30)");


    jsonData.x0 = 0;
    jsonData.y0 = 0;
    update(j3mTree.root = jsonData);
}


function update(source) {
	var i = 0,
    barHeight = 20,
    barWidth = j3mTree.w * .5,
    duration = 400;
    
  // Compute the flattened node list. TODO use d3.layout.hierarchy.
  var nodes = j3mTree.tree.nodes(j3mTree.root);
  
  // Compute the "layout".
  nodes.forEach(function(n, i) {
    n.x = i * barHeight;
  });
  
  // Update the nodes
  var node = j3mTree.vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });
  
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .style("opacity", 1e-6);

  // Enter any new nodes at the parent's previous position.
  nodeEnter.append("svg:rect")
      .attr("y", -barHeight / 2)
      .attr("height", barHeight)
      .attr("width", barWidth)
          .attr("rx", 6)
    .attr("ry", 6)
      .style("fill", color)
      .on("click", click);
  
  nodeEnter.append("svg:text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text(function(d) 
      { 
		return d.d3DisplayName;
      });
  
  // Transition nodes to their new position.
  nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);
  
  node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1)
    .select("rect")
      .style("fill", color);
  
  // Transition exiting nodes to the parent's new position.
  node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .style("opacity", 1e-6)
      .remove();
  // Update the links
  var link = j3mTree.vis.selectAll("path.link")
      .data(j3mTree.tree.links(nodes), function(d) { return d.target.id; });
  
  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return j3mTree.diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", j3mTree.diagonal);
  
  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", j3mTree.diagonal);
  
  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return j3mTree.diagonal({source: o, target: o});
      })
      .remove();
  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
//alert("click!");
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

/*******************/    
/* end json tree code */    
/*****************/

/*******************/    
/* j3m util code */    
/*****************/


var keyword_container_elements = ["data", "userAppendedData" , "associatedForms" , "answerData"];

function extractKeywords(data, path, pathIndex, keyWords) {
	if (angular.isArray(data))  {
		for (var key in data) {
	    	extractKeywords(data[key], path, pathIndex, keyWords);	
	    }
	}else if (angular.isObject(data)) {
		for (var key in data) {
			if ( key === path[pathIndex]) {
				pathIndex++;
				if (pathIndex >= path.length) {
					getEndStrings(data[key], keyWords);
				}else {
					extractKeywords(data[key], path, pathIndex, keyWords);
				}		
			}
		}		
	}else {
		if (pathIndex >= path.length) {
					console.log(JSON.stringify(data[key]));
		}
  	}
}
               
function getEndStrings(data,keyWords){
	if (angular.isArray(data) || angular.isObject(data))  {
		for (var key in data) {
			getEndStrings(data[key],keyWords);
		}
	}else {
		if (JSON.stringify(data)) {
			
			console.log(JSON.stringify(data));
			keyWords.push(data);
		}
	}
}

/*******************/    
/* end util code */    
/*****************/


/*******************/    
/* file format transformation code */    
/*****************/

function toTSV (input) {
  return toXSV(input,'\t',0);
}

function toCSV (input) {
  return toXSV(input,',',0);
}

function toXSV (d, delim, indent) {
 	var result = [];
 	
	for (var key in d) {
		var line = [];		
		for (i = 0; i < indent; i++) {
			line.push("");
		}
 		if (angular.isArray(d[key]) || angular.isObject(d[key])) 
		{
			line.push( key  + " : ");
			result.push(line.join(delim));
			result.push(toXSV(d[key], delim, (indent +1)));	
				
 		}else {
			if (angular.isArray(d)) {
				line.push( d[key] );
			} else {
				line.push( key + " : ");
				line.push( JSON.stringify(d[key]));
			} 
			result.push(line.join(delim));			
 		}
 	}
 	return result.join('\n');
}
function toHTMLWrapper(d) {
	var result = [];
 	result.push("<html><head></head><body>");
 	result.push(toHTML (d));
 	result.push("</body></html>");
 	return result.join('\n'); 
}
function toHTML (d) {
 	var result = [];
 	result.push("<ul>");
	for (var key in d) {
		var line = [];		
		
 		if (angular.isArray(d[key]) || angular.isObject(d[key])) 
		{
			line.push( "<li>" + key  + " :</li>");
			result.push(line.join(""));
			result.push(toHTML(d[key]));	
				
 		}else {
			if (angular.isArray(d)) {
				line.push( "<li>" + d[key]  + "</li>");
			} else {
				line.push( "<li>" + key + " : " + JSON.stringify(d[key])  + "</li>");
			} 
			result.push(line.join(""));			
 		}
 	}
 	result.push("</ul>");
 	return result.join('\n');
}