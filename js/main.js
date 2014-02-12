//定义全局变量
var userData = {
	gridData : new Points("gridData"),		//保存的Grid中的数据
	rowCount : 20, 				  			//Grid的默认行数
	scaleX: 1.0,							//标准坐标的X轴拉伸倍率
	scaleY: 1.0,								//标准坐标的X轴拉伸倍率
	chartColors: [
		'#4572A7', 
		'#AA4643', 
		'#89A54E', 
		'#80699B', 
		'#3D96AE', 
		'#DB843D', 
		'#92A8CD', 
		'#A47D7C', 
		'#B5CA92'
	]
};

var myApp = {
	dhxLayout : new Object,
	dhxGrid : new Object,
	dhxToolbar1 : new Object,
	dhxToolbar2 : new Object,
	statusBar : new Object,
	chart : new Object
};


//刷新图表容器的大小以适合窗口
myApp.refreshChartSize=function (){
	myApp.chart.container.style.width=myApp.dhxLayout.cells("b").getWidth()-8;
	myApp.chart.container.style.height=myApp.dhxLayout.cells("b").getHeight()-65;
	myApp.chart.setSize(myApp.dhxLayout.cells("b").getWidth()-8,myApp.dhxLayout.cells("b").getHeight()-65,false);
}

//重新绘制图表数据
myApp.redrawChart=function (){
	myApp.readGridData();
	if (userData.gridData.points.length===0) {return false;}
	userData.gridData.setScale({x:userData.scaleX,y:userData.scaleY})
	var data,alignmentName,shift,fitAxis,rotation,statusTip,colorIndex;
	data=userData.gridData.splitBy("name");
	alignmentName=myApp.dhxToolbar2.getListOptionText("alignmentSelect",myApp.dhxToolbar2.getListOptionSelected("alignmentSelect"));
	if (!alignmentName) {return false;}
	for (var i=0;i<data.length;i++){
		if (data[i].name==alignmentName) {
			shift=data[i].autoShift();
			userData.gridData.shiftSpecPos(shift.specShift);
			userData.gridData.shiftMeasPos(shift.measShift);
			fitAxis=userData.gridData.autoFitAxis();
			if (fitAxis.swapXY===true) {data[i].swapMeasXY();}
			if (fitAxis.reverseX===true) {data[i].reverseMeasX();}
			if (fitAxis.reverseY===true) {data[i].reverseMeasY();}
			rotation=data[i].calcRotation();
			userData.gridData.rotateMeasPos(rotation);
			data=userData.gridData.splitBy("name");
			statusTip="对位点:"+alignmentName;
			statusTip+="　　　X轴拉伸:"+Math.round(userData.scaleX*1000000-1000000)+" ppm";
			statusTip+=",　Y轴拉伸:"+Math.round(userData.scaleY*1000000-1000000)+" ppm";
			statusTip+="　　　旋转角度:"+roundTo(rotation,8)+"rad";
			statusTip+="　　　XY轴翻转："+(fitAxis.swapXY?"Yes":"No");
			statusTip+=",　X轴镜像："+(fitAxis.reverseX?"Yes":"No");
			statusTip+=",　Y轴镜像："+(fitAxis.reverseY?"Yes":"No");
			myApp.statusBar.setText(statusTip);
			break;
		}
	}
	while (myApp.chart.series.length>0) {
		myApp.chart.series[0].remove(false);
	}
	colorIndex=0;
	for (var i=0;i<data.length;i++){
		myApp.chart.addSeries(data[i].output(Number(myApp.dhxToolbar2.getValue("zoomSlider"))),false);
		myApp.chart.series[i].color=userData.chartColors[colorIndex++];
		if (colorIndex>=userData.chartColors.length) {
			colorIndex=0;
		}
	}
	myApp.chart.redraw();

}

//清空Grid中的数据
myApp.clearGrid=function (){
	myApp.dhxGrid.clearAll();
	for (var i=1;i<=userData.rowCount;i++){
		myApp.dhxGrid.addRow(i, [,,,,,1]);
	}
}
	
//将Grid对象中的数据读取到userData.gridData中
myApp.readGridData=function (){
	userData.gridData.points=new Array();
	try{
		for (var i=0;i<myApp.dhxGrid.getRowsNum();i++){
			if (myApp.dhxGrid.cells2(i,0).getValue()!=""){
				if (myApp.dhxGrid.cells2(i,1).getValue()=="") {myApp.dhxGrid.cells2(i,1).setValue("0")};
				if (myApp.dhxGrid.cells2(i,2).getValue()=="") {myApp.dhxGrid.cells2(i,2).setValue("0")};
				if (myApp.dhxGrid.cells2(i,3).getValue()=="") {myApp.dhxGrid.cells2(i,3).setValue("0")};
				if (myApp.dhxGrid.cells2(i,4).getValue()=="") {myApp.dhxGrid.cells2(i,4).setValue("0")};
				userData.gridData.addPoint({
					isScale:myApp.dhxGrid.cells2(i,5)==0?false:true,
					name:String(myApp.dhxGrid.cells2(i,0).getValue()),
					specX:Number(myApp.dhxGrid.cells2(i,1).getValue()),
					specY:Number(myApp.dhxGrid.cells2(i,2).getValue()),
					measX:Number(myApp.dhxGrid.cells2(i,3).getValue()),
					measY:Number(myApp.dhxGrid.cells2(i,4).getValue())
				});
			}
		}
	}catch(e){
		userData.gridData.clearData("gridData");
		alert("读取数据时发生错误！\n  数据行编号："+(i+1));
		userData.gridData.points=new Array();
	}
	return userData.gridData;
}

//刷新Chart工具栏中的下拉选择按钮
myApp.refreshGroupName=function (){
	var nameArr=myApp.getGroupNames();
	myApp.refreshListOption(myApp.dhxToolbar2,"alignmentSelect",nameArr);
	myApp.refreshListOption(myApp.dhxToolbar2,"scaleSelect",nameArr);
	if (nameArr.length===0) {
		myApp.dhxToolbar2.setItemText("alignmentSelect","对位点选择...");
		myApp.dhxToolbar2.disableItem("alignmentSelect");
		myApp.dhxToolbar2.disableItem("scaleSelect");
	}else{
		myApp.dhxToolbar2.enableItem("alignmentSelect");
		myApp.dhxToolbar2.enableItem("scaleSelect");
		var alignmentSelect=myApp.dhxToolbar2.getListOptionSelected("alignmentSelect");
		if (!alignmentSelect && nameArr.length>0) {
			myApp.dhxToolbar2.setListOptionSelected("alignmentSelect","alignmentSelect_1");
			myApp.dhxToolbar2.setItemText("alignmentSelect",myApp.dhxToolbar2.getListOptionText("alignmentSelect","alignmentSelect_1")+" 对位");
		}
	}
}

//获取表格分组名称数组
myApp.getGroupNames=function (){
	var nameArr=[],v;
	for (var i=0;i<myApp.dhxGrid.getRowsNum();i++){
		v=myApp.dhxGrid.cells2(i,0).getValue();
		if (v!=="" && nameArr.inArray(v)===-1){
			nameArr.push(myApp.dhxGrid.cells2(i,0).getValue());
		}
	}
	return nameArr;
}

//Chart工具栏选择项目刷新函数
myApp.refreshListOption=function (toolbar,listOptionId,options){
	var oldOptionIds=toolbar.getAllListOptions(listOptionId);
	var oldValue=toolbar.getListOptionSelected(listOptionId);
	if (oldValue) {oldValue=toolbar.getListOptionText(listOptionId,oldValue);}
	for (var i=0;i<oldOptionIds.length;i++){
		toolbar.removeListOption(listOptionId,oldOptionIds[i]);
	}
	for (var i=0;i<options.length;i++){
		toolbar.addListOption(listOptionId,listOptionId+'_'+(i+1),i+1,"button",options[i]);
		if (options[i]==oldValue) {
			toolbar.setListOptionSelected(listOptionId,listOptionId+'_'+(i+1));
		}
	}
}

$(document).ready(function() {
	//定义Layout对象
	myApp.dhxLayout = new dhtmlXLayoutObject(document.body, "2U");
	myApp.dhxLayout.cells("a").setWidth(390);
	myApp.dhxLayout.cells("a").setText("数据输入");
	myApp.dhxLayout.cells("b").setText("形变量示意图");
	myApp.dhxLayout.setEffect('collapse', true);
	myApp.dhxLayout.setEffect('resize', true);

	//定义Grid对象
	myApp.dhxGrid = myApp.dhxLayout.cells("a").attachGrid();
	myApp.dhxGrid.setImagePath("./lib/imgs/");
	myApp.dhxGrid.setHeader("分组名称,设计坐标,#cspan,量测坐标,#cspan,拉伸设计坐标");
	myApp.dhxGrid.attachHeader(["#rspan","X坐标", "Y坐标",  "X坐标", "Y坐标","#rspan"]);
	myApp.dhxGrid.setInitWidths("70,65,65,65,65,40");
	myApp.dhxGrid.setColAlign("center,right,right,right,right,center");
	myApp.dhxGrid.setColTypes("edtxt,edtxt,edtxt,edtxt,edtxt,ch");
	myApp.dhxGrid.init();
	myApp.clearGrid();
	myApp.dhxGrid.enableBlockSelection(true); 
	myApp.dhxGrid.enableMultiselect(true);

	//定义Toolbar对象
	myApp.dhxToolbar1 = myApp.dhxLayout.cells("a").attachToolbar();
	myApp.dhxToolbar1.setIconsPath("./lib/imgs/toolbar/");
	myApp.dhxToolbar1.loadXML("./xml/data_toolbar.xml?" + new Date().getTime());
	myApp.dhxToolbar2 = myApp.dhxLayout.cells("b").attachToolbar();
	myApp.dhxToolbar2.setIconsPath("./lib/imgs/toolbar/");
	myApp.dhxToolbar2.loadXML("./xml/chart_toolbar.xml?" + new Date().getTime());

	//定义StatusBar对象
	myApp.statusBar = myApp.dhxLayout.attachStatusBar();
	myApp.statusBar.setText("Ready.");

	//定义Chart对象
	myApp.dhxLayout.cells("b").attachObject("chart");
	Highcharts.setOptions({
		lang:{
			resetZoom:'全部显示',
			resetZoomTitle:'取消视图缩放以显示所有数据.'
		}
	});
    myApp.chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart',
            type: 'scatter',
			zoomType: 'xy'
        },
		credits: {
			enabled: true,
			href: 'http://helscn.talk4fun.net/',
			position:{
				align: 'right',
				x:-10,
				verticalAlign:'bottom',
				y:-5
			},
			style: {
				cursor: 'pointer',
				color: '#909090',
				fontSize: '10px'
			},
			text: 'By helscn'			
		},
		title: {
			text: '',
			style: {
				fontSize:'11pt'
			}
		},
        xAxis: {
            title: {
				text: 'X轴'
			},
			gridLineDashStyle:'dash',
			gridLineWidth:1,
			allowDecimals:false,
			endOnTick:true,
			startOnTick:true
        },
        yAxis: {
            title: {
                text: 'Y轴'
            },
			gridLineDashStyle:'dash',
			gridLineWidth:1,
			allowDecimals:false,
			endOnTick:true,
			startOnTick:true
        },
        tooltip: {
            formatter: function() {
				return '<span style="color:'+this.series.color+'"><b>'+this.series.name+this.point.name;
            },
			snap: 10
        },
        plotOptions: {
			series:{
				lineWidth:1
            }
        },
        series: []
    });
	
	//Layout事件绑定
	myApp.dhxLayout.attachEvent("onResizeFinish",myApp.refreshChartSize);
	myApp.dhxLayout.attachEvent("onPanelResizeFinish",myApp.refreshChartSize);
	myApp.dhxLayout.attachEvent("onCollapse",myApp.refreshChartSize);
	myApp.dhxLayout.attachEvent("onExpand",myApp.refreshChartSize);
	
	//Toolbar事件绑定
	myApp.dhxToolbar1.attachEvent("onClick",function (id){
		switch (id) {
			case "new":
				myApp.clearGrid();
				myApp.refreshGroupName();
				break;
			case "open":
				myApp.dhxGrid.clearAll();
				$("#filePath").click();
				break;
			case "copy":
				myApp.dhxGrid.copyBlockToClipboard();
				myApp.statusBar.setText("数据已经复制到剪贴板.");
				break;
			case "paste":
				myApp.dhxGrid.pasteBlockFromClipboard();
				break;
			case "redrawChart":
				myApp.redrawChart();
				break;
		}
	});
	myApp.dhxToolbar2.attachEvent("onValueChange",function (id){
		switch (id){
			case "zoomSlider":
				myApp.redrawChart();
				break;
		}
	});
	myApp.dhxToolbar2.attachEvent("onClick",function(id){
		var arg=id.split('_');
		var v,data,scale;
		switch (arg[0]){
			case "alignmentSelect":
				if (arg.length===2) {
					myApp.dhxToolbar2.setItemText("alignmentSelect",myApp.dhxToolbar2.getListOptionText("alignmentSelect",id)+" 对位");
				}
				myApp.redrawChart();
				break;
			case "scaleSelect":
				if (arg.length==2) {
					data=myApp.readGridData();
					data.autoShift();
					data.autoFitAxis();
					data=data.splitBy("name");
					v=myApp.dhxToolbar2.getListOptionText("scaleSelect",id);
					for (var i=0;i<data.length;i++){
						if (data[i].name==v){
							data[i].autoShift();
							data[i].autoRotate();
							scale=data[i].calcScaleFactor();
							if (scale.x !== null ) {
								userData.scaleX=roundTo(scale.x,6);
								myApp.dhxToolbar2.setValue("scaleX",userData.scaleX);
							}else{
								alert('计算X轴的涨缩系数时出现错误！')
							}
							if (scale.y !== null) {
								userData.scaleY=roundTo(scale.y,6);
								myApp.dhxToolbar2.setValue("scaleY",userData.scaleY);
							}else{
								alert('计算Y轴的涨缩系数时出现错误！')
							}
							break;
						}
					}
				}
				myApp.redrawChart();
				break;
		}
	})
	
	//输入框变更事件绑定
	$("div[idd]>input.inp").change(function (){
		var v=$(this).val().replace(/\s/gi,'');
		var id=$(this).parent().attr("idd");
		var regScale=/^(1|1\.\d*|0\.\d*)$/gi;
		switch (id){
			case "scaleX":
				if (regScale.test(v)===true) {
					userData.scaleX=Number(v);
				}
				$(this).val(userData.scaleX)
				break;
			case "scaleY":
				if (regScale.test(v)===true) {
					userData.scaleY=Number(v);
				}
				$(this).val(userData.scaleY)
				break;
		}
		myApp.redrawChart();
	})
	
	//Grid事件绑定
	myApp.dhxGrid.attachEvent("onEditCell", function(stage,rId,cInd,nValue,oValue){
		if (stage!==2 || nValue=="") {return true;}
		if (rId==myApp.dhxGrid.getRowsNum()) {
			myApp.dhxGrid.addRow(myApp.dhxGrid.getRowsNum()+1, [,,,,,1]);
		}
		if (cInd===0) {
			myApp.refreshGroupName();
		}else if (cInd<5){
			var reg=/^\-?\d+\.?\d*$/gi;
			var bool=reg.test(nValue);
			if (bool===true) {
				return true;
			} else {
				alert('输入的数据格式不正确！');
				return false;
			}
		}
		return true;
	});
	myApp.dhxGrid.attachEvent("onKeyPress",function (code,cFlag,sFlag){
		if (code===46 && cFlag===false && sFlag===false){
			myApp.dhxGrid.clearSelection();
		}else if (code===67 && cFlag===true && sFlag==false) {
			myApp.dhxGrid.copyBlockToClipboard();
			myApp.statusBar.setText("数据已经复制到剪贴板.");
		}else if (code===86 && cFlag===true && sFlag==false){
			myApp.dhxGrid.pasteBlockFromClipboard();
		}
		return true;
	});
		
	//文件选择事件绑定
	$("#filePath").change(function (){
		myApp.dhxGrid.load($("#filePath").attr("value"),"csv");
		for (var i=0;i<myApp.dhxGrid.getRowsNum();i++){
			if (myApp.dhxGrid.cells2(i,0).getValue()!=""){
				if (myApp.dhxGrid.cells2(i,1).getValue()=="") {myApp.dhxGrid.cells2(i,2).setValue("0")};
				if (myApp.dhxGrid.cells2(i,2).getValue()=="") {myApp.dhxGrid.cells2(i,3).setValue("0")};
				if (myApp.dhxGrid.cells2(i,3).getValue()=="") {myApp.dhxGrid.cells2(i,4).setValue("0")};
				if (myApp.dhxGrid.cells2(i,4).getValue()=="") {myApp.dhxGrid.cells2(i,5).setValue("0")};
			}
		}
		myApp.dhxGrid.checkAll(true);
		myApp.refreshGroupName();
	})

	//windows事件绑定
	$(window).resize(myApp.refreshChartSize);
	myApp.refreshChartSize();

});
