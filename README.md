in this example the json j3m object is inlined in index.htm as "var _jsonData", this reference will need to be replaced with the real object

all the tree needs to work is:
 - a div with the id of 'chart', in which the chart will be drawn
 - the j3m (or any other json object) to be converted into the format the tree expcts via:
     var jsonData = {"d3DisplayName" : "j3m : ", "children" :convertToTree(_jsonData)};
 - a call to initTree(jsonData);