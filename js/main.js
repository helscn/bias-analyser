//定义全局变量
var myApp = {
	dhxLayout : new Object,
	dhxGrid : new Object,
	dhxToolbar1 : new Object,
	dhxToolbar2 : new Object,
	statusBar : new Object,
	chart : new Object
};

var userData = {
	gridRecords : new Array(),	//保存表格记录对象的数组
	posData : new Array(),		//计算旋转角度及涨缩时用到的坐标数据
	rowCount : 24   			//Grid的默认行数
};

$(document).ready(function() {
	myApp.dhxLayout = new dhtmlXLayoutObject(document.body, "2U");

	myApp.dhxLayout.cells("a").setWidth(390);
	myApp.dhxLayout.cells("a").setText("数据输入");
	myApp.dhxToolbar1 = myApp.dhxLayout.cells("a").attachToolbar();
	myApp.dhxToolbar1.setIconsPath("./lib/imgs/toolbar/");
	myApp.dhxToolbar1.loadXML("./data/dhxtoolbar.xml?" + new Date().getTime());
	myApp.dhxGrid = myApp.dhxLayout.cells("a").attachGrid();
	myApp.dhxGrid.setImagePath("./lib/imgs/");
	myApp.dhxGrid.setHeader("是否拉伸,分组名称,设计坐标,#cspan,量测坐标,#cspan");
	myApp.dhxGrid.attachHeader(["#rspan","#rspan","X坐标", "Y坐标",  "X坐标", "Y坐标"]);
	myApp.dhxGrid.setInitWidths("40,70,65,65,65,65");
	myApp.dhxGrid.setColAlign("center,center,right,right,right,right");
	myApp.dhxGrid.setColTypes("ch,edtxt,edtxt,edtxt,edtxt,edtxt");
	myApp.dhxGrid.enableValidation(true,true);
	myApp.dhxGrid.setColValidators([,"NotEmpty","ValidNumeric","ValidNumeric","ValidNumeric","ValidNumeric"]);
	myApp.dhxGrid.init();
	for (var i=0;i<userData.rowCount;i++){
		myApp.dhxGrid.addRow(i, [1]);
	}

	myApp.dhxLayout.cells("b").setText("形变量示意图");
	myApp.dhxToolbar2 = myApp.dhxLayout.cells("b").attachToolbar();
	myApp.dhxToolbar2.setIconsPath("./lib/imgs/toolbar/");
	myApp.dhxToolbar2.loadXML("./data/dhxtoolbar.xml?" + new Date().getTime());
	myApp.dhxLayout.cells("b").attachObject("chart");
	myApp.dhxGrid.attachEvent("onLiveValidationError",function(id){
		myApp.statusBar.setText(id);;
	});
	//myApp.dhxLayout.setEffect('collapse', true);
	//myApp.dhxLayout.setEffect('resize', true);
	myApp.statusBar = myApp.dhxLayout.attachStatusBar();
	myApp.statusBar.setText("Simple Status Bar");
	

	
	Highcharts.setOptions({
		lang:{
			resetZoom:'恢复原始大小',
			resetZoomTitle:'取消视图缩放以显示所有数据.'
		}
	});
    myApp.chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart',
            type: 'line',
			zoomType: 'xy'
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
			gridLineWidth:1
        },
        yAxis: {
            title: {
                text: 'Y轴'
            },
			gridLineDashStyle:'dash',
			gridLineWidth:1
        },
        tooltip: {
            formatter: function() {
                return 'X: '+this.x+' mil<br />Y: '+this.y+' mil<br />'+'D: '+Math.round(Math.sqrt(this.x*this.x+this.y*this.y)*100)/100+' mil';
            }
        },
        plotOptions: {
			series:{
				lineWidth:1,
				radius:1,
				lineWidth:1,
				pointStart:1
            }
        },
        series: [/*{
            name: 'X1',
            marker: {
                symbol: 'circle'
            },
            data: [[100,2],[-300,4],null,[500,600],[-270,-300]]
        }, {
            name: 'X2',
            marker: {
                symbol: 'circle'
            },
            data: []
        },{
            name: 'Y1',
            marker: {
                symbol: 'circle'
            },
            data: []
        },{
            name: 'Y2',
            marker: {
                symbol: 'circle'
            },
            data: []
        }*/]
    });
	
	myApp.dhxLayout.attachEvent("onResizeFinish",function(){
		refreshChartSize();
	});
	
/*
	$("[title]").qtip({
		style:{
			name:'blue',
			tip:true
		},
		position:{
			target:'mouse',
			adjust:{
				mouse:true,
				screen:true,
				x:0,
				y:-5
			}
		},
		show:{
			effect:{
				type:'fade',
				length:300
			}
		},
		hide:{
			effect:{
				type:'fade',
				length:300
			}
		}
	});
*/
});

function refreshChartSize(){
	//if (myApp.dhxLayout.cells("b").getWidth()<305) {
	//	myApp.chart.container.style.width="300px";
	//}else{
		myApp.chart.container.style.width=myApp.dhxLayout.cells("b").getWidth()-5;
	//}
	//if (myApp.dhxLayout.cells("b").getHeight()<330) {
	//	myApp.chart.container.style.height="300px";
	//}else{
		myApp.chart.container.style.height=myApp.dhxLayout.cells("b").getHeight()-65;
	//}
}
