//定义全局变量
var userData = {
	gridData : new Points("gridData"),		//保存的Grid中的数据
	rowCount : 36 				  			//Grid的默认行数
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
	var data=myApp.readGridData().clone().autoShift().autoFitAxis().autoRotate().splitBy("name");
	var scaleFactor;
	while (myApp.chart.series.length>0) {
		myApp.chart.series[0].remove(false);
	}
	for (var i=0;i<data.length;i++){
		if (i===0) {
			scaleFactor=data[0].calcScaleFactor();
		}
		data[i].setScale(scaleFactor);
		myApp.chart.addSeries(data[i].output(Number(myApp.dhxToolbar2.getValue("zoomSlider"))*100),false);
	}
	myApp.chart.redraw();
}

//清空Grid中的数据
myApp.clearGrid=function (){
	myApp.dhxGrid.clearAll();
	for (var i=0;i<userData.rowCount;i++){
		myApp.dhxGrid.addRow(i, [1]);
	}
}
	
//将Grid对象中的数据读取到userData.gridData中
myApp.readGridData=function (){
	userData.gridData.points=new Array();
	try{
		for (var i=0;i<myApp.dhxGrid.getRowsNum();i++){
			if (myApp.dhxGrid.cells2(i,1).getValue()!=""){
				if (myApp.dhxGrid.cells2(i,2).getValue()=="") {myApp.dhxGrid.cells2(i,2).setValue("0")};
				if (myApp.dhxGrid.cells2(i,3).getValue()=="") {myApp.dhxGrid.cells2(i,3).setValue("0")};
				if (myApp.dhxGrid.cells2(i,4).getValue()=="") {myApp.dhxGrid.cells2(i,4).setValue("0")};
				if (myApp.dhxGrid.cells2(i,5).getValue()=="") {myApp.dhxGrid.cells2(i,5).setValue("0")};
				userData.gridData.addPoint({
					isScale:myApp.dhxGrid.cells2(i,0)==0?false:true,
					name:String(myApp.dhxGrid.cells2(i,1).getValue()),
					specX:Number(myApp.dhxGrid.cells2(i,2).getValue()),
					specY:Number(myApp.dhxGrid.cells2(i,3).getValue()),
					measX:Number(myApp.dhxGrid.cells2(i,4).getValue()),
					measY:Number(myApp.dhxGrid.cells2(i,5).getValue())
				});
			}
		}
	}catch(e){
		userData.gridData.clearData("gridData");
		alert("读取数据时发生错误！\n  数据行编号："+i);
	}
	return userData.gridData;
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
	myApp.dhxGrid.setHeader("拉伸设计坐标,分组名称,设计坐标,#cspan,量测坐标,#cspan");
	myApp.dhxGrid.attachHeader(["#rspan","#rspan","X坐标", "Y坐标",  "X坐标", "Y坐标"]);
	myApp.dhxGrid.setInitWidths("40,70,65,65,65,65");
	myApp.dhxGrid.setColAlign("center,center,right,right,right,right");
	myApp.dhxGrid.setColTypes("ch,edtxt,edtxt,edtxt,edtxt,edtxt");
	myApp.dhxGrid.enableValidation(true,true);
	myApp.dhxGrid.setColValidators([,"NotEmpty","ValidNumeric","ValidNumeric","ValidNumeric","ValidNumeric"]);
	myApp.dhxGrid.init();
	myApp.clearGrid();
	
	//定义Toolbar对象
	myApp.dhxToolbar1 = myApp.dhxLayout.cells("a").attachToolbar();
	myApp.dhxToolbar1.setIconsPath("./lib/imgs/toolbar/");
	myApp.dhxToolbar1.loadXML("./xml/data_toolbar.xml?" + new Date().getTime());
	myApp.dhxToolbar2 = myApp.dhxLayout.cells("b").attachToolbar();
	myApp.dhxToolbar2.setIconsPath("./lib/imgs/toolbar/");
	myApp.dhxToolbar2.loadXML("./xml/chart_toolbar.xml?" + new Date().getTime());

	//定义StatusBar对象
	myApp.statusBar = myApp.dhxLayout.attachStatusBar();
	myApp.statusBar.setText("Simple Status Bar");

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
				break;
			case "open":
				myApp.dhxGrid.clearAll();
				$("#filePath").click();
				myApp.dhxGrid.load($("#filePath").attr("value"),"csv");
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
//	myApp.dhxToolbar2.addListOption("alignmentSelect", "1", 1, "button", "A_test!");
//	myApp.dhxToolbar2.addListOption("alignmentSelect", "2", 2, "button", "B_test!");
//	myApp.dhxToolbar2.addListOption("alignmentSelect", "3", 3, "button", "C_test!");
	
	
	//windows事件绑定
	$(window).resize(myApp.refreshChartSize);
	myApp.refreshChartSize();


});
