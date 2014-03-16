//定义全局变量
var userData = {
	gridData : new Points("gridData"),		//保存的Grid中的数据
	rowCount : 20, 				  			//Grid的默认行数
	scaleX: 1.0,							//标准坐标的X轴拉伸倍率
	scaleY: 1.0,							//标准坐标的X轴拉伸倍率
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
	dhxWins : new Object,
	dhxGrid : new Object,
	dhxMenu : new Object,
	dhxToolbar1 : new Object,
	dhxToolbar2 : new Object,
	statusBar : new Object,
	chart : new Object,
	popupWindow : new Object
};

$(document).ready(function() {
	//定义Layout对象
	myApp.dhxLayout = new dhtmlXLayoutObject(document.body, "2U");
	myApp.dhxLayout.cells("a").setWidth(390);
	myApp.dhxLayout.cells("a").setText("数据输入");
	myApp.dhxLayout.cells("b").setText("形变量示意图");
	myApp.dhxLayout.setEffect('collapse', true);
	myApp.dhxLayout.setEffect('resize', true);
	
	//定义消息显示对象
	myApp.dhxWins=new dhtmlXWindows();
	myApp.dhxWins.setImagePath("./lib/imgs/icons/");
	myApp.popMessage=function (title,text,icon,icon_dis){
		$("<div>",{
			id:"popMessage",
			text:text,
			"class":"popMessage"
		}).appendTo("body");
		var m=myApp.dhxWins.createWindow("popMessage",0,0,300,200);
		m.setText(title);
		m.setModal(true);
		m.attachObject("popMessage",true);
		m.centerOnScreen();
		m.setIcon(icon || "about.gif",icon_dis || icon || "about_dis.gif");
		m.button("minmax1").hide();
		m.button("minmax2").hide();
		m.button("park").hide();
	}

	//定义Grid对象
	myApp.dhxGrid = myApp.dhxLayout.cells("a").attachGrid();
	myApp.dhxGrid.setImagePath("./lib/imgs/");
	myApp.dhxGrid.setHeader("分组名称,设计坐标,#cspan,量测坐标,#cspan,拉伸设计坐标");
	myApp.dhxGrid.attachHeader(["#rspan","X坐标", "Y坐标",  "X坐标", "Y坐标","#rspan"]);
	myApp.dhxGrid.setInitWidths("70,65,65,65,65,40");
	myApp.dhxGrid.setColAlign("center,right,right,right,right,center");
	myApp.dhxGrid.setColTypes("edtxt,edtxt,edtxt,edtxt,edtxt,ch");
	myApp.dhxGrid.init();
	myApp.dhxGrid.enableBlockSelection(true); 
	myApp.dhxGrid.enableMultiselect(true);
	myApp.dhxGrid.csv.cell="\t";
	myApp.dhxGrid.csv.row="\n";
	
	//定义Menu对象
	myApp.dhxMenu = myApp.dhxLayout.cells("a").attachMenu();
	myApp.dhxMenu.setIconsPath("./lib/imgs/icons/");
	myApp.dhxMenu.loadXML("./xml/data_menu.xml?" + new Date().getTime());

	//定义Toolbar对象
	myApp.dhxToolbar1 = myApp.dhxLayout.cells("a").attachToolbar();
	myApp.dhxToolbar1.setIconsPath("./lib/imgs/icons/");
	myApp.dhxToolbar1.loadXML("./xml/data_toolbar.xml?" + new Date().getTime());
	myApp.dhxToolbar2 = myApp.dhxLayout.cells("b").attachToolbar();
	myApp.dhxToolbar2.setIconsPath("./lib/imgs/icons/");
	myApp.dhxToolbar2.loadXML("./xml/chart_toolbar.xml?" + new Date().getTime());

	//定义StatusBar对象
	myApp.statusBar = myApp.dhxLayout.attachStatusBar();
	myApp.statusBar.setText("准备就绪.");

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
			text: 'Powered by helscn'			
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

	//刷新图表容器的大小以适合窗口
	myApp.refreshChartSize=function (){
		myApp.chart.container.style.width=myApp.dhxLayout.cells("b").getWidth()-8;
		myApp.chart.container.style.height=myApp.dhxLayout.cells("b").getHeight()-65;
		myApp.chart.setSize(myApp.dhxLayout.cells("b").getWidth()-8,myApp.dhxLayout.cells("b").getHeight()-65,false);
	}

	//检查输入框中的涨缩拉伸系数
	myApp.checkScaleInput=function (id){
		if (id!=="scaleX" && id!=="scaleY") {return null;}
		var scaleValue,regScale=/^(1|1\.\d*|0\.\d*)$/gi;
		scaleValue=myApp.dhxToolbar2.getValue(id).replace(/\s/gi,'');
		if (regScale.test(scaleValue)){
			userData[id]=parseFloat(scaleValue);
		}else{
			myApp.dhxToolbar2.setValue(id,roundTo(userData[id],6))
		}
	}

	//清空Grid中的数据
	myApp.clearGrid=function (){
		myApp.dhxGrid.clearAll();
		for (var i=1;i<=userData.rowCount;i++){
			myApp.dhxGrid.addRow(i, [,,,,,1]);
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
			myApp.popMessage("数据错误","读取数据时发生错误！\n  数据行编号："+(i+1));
			userData.gridData.points=new Array();
		}
		return userData.gridData;
	}

	//重新绘制图表数据
	myApp.redrawChart=function (){
		myApp.checkScaleInput("scaleX");
		myApp.checkScaleInput("scaleY");
		myApp.readGridData();
		while (myApp.chart.series.length>0) {
			myApp.chart.series[0].remove(false);
		}
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

	//刷新Chart工具栏中的下拉选择按钮
	myApp.refreshGroupName=function (){
		var nameArr=myApp.getGroupNames();
		myApp.refreshListOption(myApp.dhxToolbar2,"alignmentSelect",nameArr);
		myApp.refreshListOption(myApp.dhxToolbar2,"scaleSelect",nameArr);
		if (nameArr.length===0) {
			myApp.dhxMenu.setItemDisabled("redrawChart");
			myApp.dhxToolbar1.disableItem("redrawChart");
			myApp.dhxToolbar2.setItemText("alignmentSelect","对位点选择...");
			myApp.dhxToolbar2.disableItem("alignmentSelect");
			myApp.dhxToolbar2.disableItem("scaleSelect");
		}else{
			myApp.dhxMenu.setItemEnabled("redrawChart");
			myApp.dhxToolbar1.enableItem("redrawChart");
			myApp.dhxToolbar2.enableItem("alignmentSelect");
			myApp.dhxToolbar2.enableItem("scaleSelect");
			var alignmentSelect=myApp.dhxToolbar2.getListOptionSelected("alignmentSelect");
			if (!alignmentSelect && nameArr.length>0) {
				myApp.dhxToolbar2.setListOptionSelected("alignmentSelect","alignmentSelect_1");
				myApp.dhxToolbar2.setItemText("alignmentSelect",myApp.dhxToolbar2.getListOptionText("alignmentSelect","alignmentSelect_1")+" 对位");
			}
		}
	}

	//载入CSV格式的数据文件
	myApp.loadCSV=function (v){
		myApp.dhxGrid.csv.cell=",";
		myApp.dhxGrid.csv.row="\n";
		myApp.dhxGrid.clearAll();
		myApp.dhxGrid.load(v,"csv");
		myApp.dhxGrid.csv.cell="\t";
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
		myApp.redrawChart();
	}

	//打开并载入CSV格式的数据文件
	myApp.openCSV=function (){
		$("input.fileSelect").remove();
		var $file=$("<input>", {
			"class": "fileSelect",
			type: "file"
		}).appendTo("body");
		$file.change(function(){
			myApp.loadCSV($(this).val());
		});
		$file.click();
	}

	//Layout事件绑定
	myApp.dhxLayout.attachEvent("onResizeFinish",myApp.refreshChartSize);
	myApp.dhxLayout.attachEvent("onPanelResizeFinish",myApp.refreshChartSize);
	myApp.dhxLayout.attachEvent("onCollapse",myApp.refreshChartSize);
	myApp.dhxLayout.attachEvent("onExpand",myApp.refreshChartSize);
	
	//Menu事件绑定
	myApp.dhxMenu.attachEvent("onClick",function (id,zoneId,casState){
		switch (id){
			case "redrawChart":
				myApp.redrawChart();
				break;
			case "new":
				myApp.clearGrid();
				myApp.refreshGroupName();
				myApp.redrawChart();
				break;
			case "open":
				myApp.openCSV();
				break;
			case "add":
				myApp.dhxGrid.addRow(myApp.dhxGrid.getRowsNum()+1, [,,,,,1]);
				myApp.statusBar.setText("当前数据表行数："+myApp.dhxGrid.getRowsNum());
				break;
			case "copy":
				myApp.dhxGrid.copyBlockToClipboard();
				myApp.statusBar.setText("数据已经复制到剪贴板.");
				break;
			case "copyall":
				myApp.dhxGrid.gridToClipboard();
				myApp.statusBar.setText("所有数据已经全部复制到剪贴板中.");
				break;
			case "paste":
				myApp.dhxGrid.pasteBlockFromClipboard();
				break;
			case "about":
				var aboutWin=myApp.dhxWins.createWindow("about",0,0,300,200);
				aboutWin.setModal(true);
				aboutWin.attachURL("./about.html");
				aboutWin.setIcon("about.gif","about_dis.gif");
				aboutWin.button("park").hide();
				aboutWin.setText("关于...");
				aboutWin.centerOnScreen();
				break;
			case "loadSample":
				myApp.loadCSV("xml/sample.csv");
				break;
		}
	});
	
	//Toolbar事件绑定
	myApp.clearGrid();
	myApp.dhxToolbar1.attachEvent("onClick",function (id){
		switch (id) {
			case "new":
				myApp.clearGrid();
				myApp.refreshGroupName();
				myApp.redrawChart();
				break;
			case "add":
				myApp.dhxGrid.addRow(myApp.dhxGrid.getRowsNum()+1, [,,,,,1]);
				myApp.statusBar.setText("当前数据表行数："+myApp.dhxGrid.getRowsNum());
				break;
			case "open":
				myApp.openCSV();
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
								myApp.popMessage("涨缩计算错误","计算X轴的涨缩系数时出现错误！");
							}
							if (scale.y !== null) {
								userData.scaleY=roundTo(scale.y,6);
								myApp.dhxToolbar2.setValue("scaleY",userData.scaleY);
							}else{
								myApp.popMessage("涨缩计算错误","计算Y轴的涨缩系数时出现错误！");
							}
							break;
						}
					}
				}
				myApp.redrawChart();
				break;
		}
	})
	
	//输入框输入事件绑定
	myApp.dhxToolbar2.attachEvent("onEnter", function(id, value){
		myApp.dhxToolbar2.forEachItem(function(itemId) {
			if (itemId==="scaleX" || itemId==="scaleY"){
				myApp.checkScaleInput(itemId);
				myApp.redrawChart();
			}
		});
	});
	
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
				myApp.popMessage("数据错误","输入的数据格式不正确！");
				return false;
			}
		}
		return true;
	});
	
	myApp.dhxGrid.attachEvent("onKeyPress",function (code,cFlag,sFlag){
		if (code===27 && cFlag===false && sFlag===false){
			//按下ESC
			myApp.dhxGrid.clearSelection();
		}else if (code===67 && cFlag===true && sFlag==false) {
			//按下Ctrl+C
			myApp.dhxGrid.copyBlockToClipboard();
			myApp.statusBar.setText("数据已经复制到剪贴板.");
		}else if (code===86 && cFlag===true && sFlag==false){
			//按下Ctrl+V
			myApp.dhxGrid.pasteBlockFromClipboard();
		}else if (code===67 && cFlag===true && sFlag==true){
			//按下Ctrl+Shift+C
			myApp.dhxGrid.gridToClipboard();
			myApp.statusBar.setText("所有数据已经全部复制到剪贴板中.");
		}else if (code===186 && cFlag===true && sFlag==false){
			//按下Ctrl+;
			myApp.dhxGrid.addRow(myApp.dhxGrid.getRowsNum()+1, [,,,,,1]);
			myApp.statusBar.setText("当前数据表行数："+myApp.dhxGrid.getRowsNum());
		}else if (code===77 && cFlag===true && sFlag==true){
			//按下Ctrl+Shift+M
			myApp.redrawChart();
		}else if (code===78 && cFlag===true && sFlag==true){
			//按下Ctrl+Shift+N
			myApp.clearGrid();
		}else if (code===79 && cFlag===true && sFlag==true){
			//按下Ctrl+Shift+O
			myApp.openCSV();
		}
		return true;
	});
	
	//windows事件绑定
	$(window).resize(myApp.refreshChartSize);
	myApp.refreshChartSize();
	myApp.dhxMenu.setItemDisabled("redrawChart");
	myApp.dhxToolbar1.disableItem("redrawChart");
	myApp.dhxToolbar2.disableItem("alignmentSelect");
	myApp.dhxToolbar2.disableItem("scaleSelect");
	
	//剪贴板禁用错误提示
	dhtmlxError.catchError("Clipboard",function(){
		myApp.popMessage("错误","当前浏览器的剪贴板操作被禁用，无法使用自动剪贴功能！")
	})
});
