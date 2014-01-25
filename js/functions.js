
//定义数据点对象
/*
	.isScale							计算偏差量时是否对标准坐标拉伸
	.name								数据点的名字字符串
	.specX								设计X坐标
	.specY								设计Y坐标
	.measX								量测X坐标
	.measY								量测Y坐标
	.scaleX								X轴的拉伸系数
	.scaleY								Y轴的拉伸系数
	.biasX(zoomFactor)					X轴方向上量测坐标与设计坐标的偏差量，ZoomFactor为偏差量缩放系数
	.biasY(zoomFactor)					Y轴方向上量测坐标与设计坐标的偏差量，ZoomFactor为偏差量缩放系数
	.moveMeasPos(shiftX,shiftY)			平移设计坐标的坐标原点
	.moveMeasPos(shiftX,shiftY)			平移量测坐标的坐标原点
	.swapMeasXY()						将量测坐标的X,Y进行交换
*/
function Point(isScale,name,specX,specY,measX,measY,scaleX,scaleY){
	this.isScale=new Boolean(isScale);
	this.name=new String(name);
	this.specX=new Number(specX);
	this.specY=new Number(specY);
	this.measX=new Number(measX);
	this.measY=new Number(measY);
	this.scaleX=new Number(scaleX || 1);
	this.scaleY=new Number(scaleY || 1);
	return this;
}

//返回X轴偏差量
Point.prototype.biasX=function (zoomFactor){
	zoomFactor = zoomFactor || 1;
	return this.isScale?((this.measX-this.specX*this.scaleX)*zoomFactor):((this.measX-this.specX)*zoomFactor);
}

//返回Y轴偏差量
Point.prototype.biasY=function(zoomFactor){
	zoomFactor = zoomFactor || 1;
	return this.isScale?((this.measY-this.specY*this.scaleY)*zoomFactor):((this.measY-this.specY)*zoomFactor);
}

//平移标准坐标的坐标原点
Point.prototype.moveSpecPos=function (shiftX,shiftY){
	this.specX=this.specX-shiftX;
	this.specY=this.specY-shiftY;
}

//平移量测坐标的坐标原点
Point.prototype.moveMeasPos=function (shiftX,shiftY){
	this.measX=this.measX-shiftX;
	this.measY=this.measY-shiftY;
}

//将量测坐标的X,Y进行交换
Point.prototype.swapMeasXY=function (){
	var temp=this.measX;
	this.measX=this.measY;
	this.measY=temp;
}

//定义数据点组合对象
/*
	.points								保存Point对象的Array
	.name								数据点组的名称字符串
	.addPoint(isScale,name,specX,specY,measX,measY,scaleX,scaleY)
										增加数据点，参数格式同Point对象
	.clone()							返回一个复制的数据点组
	.moveSpecPos(shiftX,shiftY)			平移标准坐标原点
	.moveMeasPos(shiftX,shiftY)			平移量测坐标原点
	.swapMeasXY()						将量测坐标的X,Y进行交换
	.reverseMeasX()						将量测坐标的X轴反转
	.reverseMeasY()						将量测坐标的Y轴反转
	.setIsScale(isScale)				将所有数据点统一设置是否缩放
	.setScale(scaleX,scaleY)			将所有数据点统一设置拉伸系数
	.splitBy(propertyName)				将数据按照属性名称进行分组,对应属性的值会被保存到数据点组的name属性
	.calcRotation()						计算当量测坐标与设计坐标位置最接近时的旋转角度
	.rotateMeasPos(radian)				对量测坐标进行角度旋转
	.calcStatistics()					计算数据点组的统计结果,包括最大最小及平均值
	.stdev(isSwapXY,isReverseX,isReverseY)
										计算数据点组的标准差
	.autoFitAxis()						自动将量测坐标与标准坐标的坐标系方向进行匹配
	.clearData()						清空数据
*/
function Points(name){
	this.points=new Array();
	this.name=new String(name);
	return this;
}

//增加数据点
Points.prototype.addPoint=function (isScale,name,specX,specY,measX,measY,scaleX,scaleY){
	this.points.push(new Point(isScale,name,specX,specY,measX,measY,scaleX,scaleY));
}

//返回一个复制的数据点组
Points.prototype.clone=function (){
	var copyPoints=new Points(this.name);
	for (var i=0;i<this.points.length;i++){
		copyPoints.addPoint(this.points[i].isScale,this.points[i].name,this.points[i].specX,this.points[i].specY,this.points[i].measX,this.points[i].measY,this.points[i].scaleX,this.points[i].scaleY);
	}
	return copyPoints;
}

//平移标准坐标的坐标原点
Points.prototype.moveSpecPos=function (shiftX,shiftY){
	for (var i=0;i<this.points.length;i++){
		this.points[i].specX=this.points[i].specX-shiftX;
		this.points[i].specY=this.points[i].specY-shiftY;
	}
}

//平移标准坐标的坐标原点
Points.prototype.moveMeasPos=function (shiftX,shiftY){
	for (var i=0;i<this.points.length;i++){
		this.points[i].measX=this.points[i].measX-shiftX;
		this.points[i].measY=this.points[i].measY-shiftY;
	}
}

//将量测坐标的X,Y进行交换
Points.prototype.swapMeasXY=function (){
	for (var i=0;i<this.points.length;i++){
		this.points[i].swapMeasXY();
	}
}

//将量测坐标的X轴反转
Points.prototype.reverseMeasX=function (){
	for (var i=0;i<this.points.length;i++){
		this.points[i].measX *= -1;
	}
}

//将量测坐标的Y轴反转
Points.prototype.reverseMeasY=function (){
	for (var i=0;i<this.points.length;i++){
		this.points[i].measY *= -1;
	}
}

//统一设置是否拉伸坐标
Points.prototype.setIsScale=function (isScale){
	for (var i=0;i<this.points.length;i++){
		this.points[i].isScale=Boolean(isScale);
	}
}

//统一设置拉伸系数
Points.prototype.setScale=function (scaleX,scaleY){
	for (var i=0;i<this.points.length;i++){
		if(scaleX!==undefined){
			this.points[i].scaleX=Number(scaleX);
		}
		if(scaleY!==undefined){
			this.points[i].scaleY=Number(scaleY);
		}
	}
}

//将数据按照属性名称进行分组,对应属性的值会被保存到数据点组的name属性
Points.prototype.splitBy=function (propertyName){
	var tempPointsArr=new Array();
	var tempNameArr=new Array();
	var tempName,tempID;
	for (var i=0;i<this.points.length;i++){
		tempName=this.points[propertyName].toString();
		tempID=tempNameArr.inArray(tempName);
		if (-1===tempID){
			tempNameArr.push(tempName);
			tempPointsArr[tempPointsArr.push(new Points(tempName))-1].addPoint(this.points.isScale,this.points.name,this.points.specX,this.points.specY,this.points.measX,this.points.measY,this.points.scaleX,this.points.scaleY);
		}else{
			tempPointsArr[tempID].addPoint(this.points.isScale,this.points.name,this.points.specX,this.points.specY,this.points.measX,this.points.measY,this.points.scaleX,this.points.scaleY);
		}
	}
	return tempPointsArr;
}

//计算当量测坐标与设计坐标位置最接近时的旋转角度
Points.prototype.calcRotation=function (){
	var sumProduct=[0,0,0,0];
	for (var i=0;i<this.points.length;i++){
		sumProduct[0]+=this.points[i].specY * this.points[i].measX;
		sumProduct[1]+=this.points[i].specX * this.points[i].measY;
		sumProduct[2]+=this.points[i].specX * this.points[i].measX;
		sumProduct[3]+=this.points[i].specY * this.points[i].measY;
	}
	return Math.atan((sumProduct[0]-sumProduct[1])/(sumProduct[2]+sumProduct[3]));
}

//对量测坐标进行角度旋转
Points.prototype.rotateMeasPos=function (radian){
	var tempX,tempY;
	for (var i=0;i<this.points.length;i++){
		tempX=this.points[i].measX;
		tempY=this.points[i].measY;
		this.points[i].measX=tempX * Math.cos(radian) - tempY * Math.sin(radian);
		this.points[i].measY=tempX * Math.sin(radian) + tempY * Math.cos(radian);
	}
}

//计算数据点组的统计数据结果
Points.prototype.calcStatistics=function (){
	var result={
		minSpecX:null,
		maxSpecX:null,
		avgSpecX:null,
		minSpecY:null,
		maxSpecY:null,
		avgSpecY:null,
		minMeasX:null,
		maxMeasX:null,
		avgMeasX:null,
		minMeasY:null,
		maxMeasY:null,
		avgMeasY:null
	};
	for (var i=0;i<this.points.length;i++){
		result.minSpecX=(result.minSpecX==null ? this.points[i].specX : (this.points[i].specX<result.minSpecX ? this.points[i].specX : result.minSpecX));
		result.maxSpecX=(result.maxSpecX==null ? this.points[i].specX : (this.points[i].specX>result.maxSpecX ? this.points[i].specX : result.maxSpecX));
		result.avgSpecX+=this.points[i].specX;
		result.minSpecY=(result.minSpecY==null ? this.points[i].specY : (this.points[i].specY<result.minSpecY ? this.points[i].specY : result.minSpecY));
		result.maxSpecY=(result.maxSpecY==null ? this.points[i].specY : (this.points[i].specY>result.maxSpecY ? this.points[i].specY : result.maxSpecY));
		result.avgSpecY+=this.points[i].specY;
		result.minMeasX=(result.minMeasX==null ? this.points[i].measX : (this.points[i].measX<result.minMeasX ? this.points[i].measX : result.minMeasX));
		result.maxMeasX=(result.maxMeasX==null ? this.points[i].measX : (this.points[i].measX>result.maxMeasX ? this.points[i].measX : result.maxMeasX));
		result.avgMeasX+=this.points[i].measX;
		result.minMeasY=(result.minMeasY==null ? this.points[i].measY : (this.points[i].measY<result.minMeasY ? this.points[i].measY : result.minMeasY));
		result.maxMeasY=(result.maxMeasY==null ? this.points[i].measY : (this.points[i].measY>result.maxMeasY ? this.points[i].measY : result.maxMeasY));
		result.avgMeasY+=this.points[i].measY;
	}
	result.avgSpecX /= this.points.length;
	result.avgSpecY /= this.points.length;
	result.avgMeasX /= this.points.length;
	result.avgmeasY /= this.points.length;
	return result;
}

//计算数据点组的标准差
Points.prototype.stdev=function (isSwapXY,isReverseX,isReverseY){
	var measX,measY,s=0;
	for (var i=0;i<this.points.length;i++){
		measX=isSwapXY?(isReverseX?-this.points[i].measY:this.points[i].measY):(isReverseX?-this.points[i].measX:this.points[i].measX);
		measY=isSwapXY?(isReverseY?-this.points[i].measX:this.points[i].measX):(isReverseY?-this.points[i].measY:this.points[i].measY);
		if (this.points[i].isScale){
			s+=Math.pow(measX-this.points[i].specX*this.points[i].scaleX,2)+Math.pow(measY-this.points[i].specY*this.points[i].scaleY,2);
		}else{
			s+=Math.pow(measX-this.points[i].specX,2)+Math.pow(measY-this.points[i].specY,2);
		}
	}
	return Math.sqrt(s);
}

//自动将量测坐标与标准坐标的坐标系方向进行匹配
Points.prototype.autoFitAxis=function (){
	var isSwapXY=false,isReverseX=false,isReverseY=false;
	var tempStdev,minStdev;
	minStdev=this.stdev();
	tempStdev=this.stdev(false,false,true);
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=false;
		isReverseX=false;
		isReverseY=true;
	}
	tempStdev=this.stdev(false,true,false);
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=false;
		isReverseX=true;
		isReverseY=false;
	}
	tempStdev=this.stdev(false,true,true);
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=false;
		isReverseX=true;
		isReverseY=true;
	}
	tempStdev=this.stdev(true,false,false);
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=true;
		isReverseX=false;
		isReverseY=false;
	}
	tempStdev=this.stdev(true,false,true);
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=true;
		isReverseX=false;
		isReverseY=true;
	}
	tempStdev=this.stdev(true,true,false);
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=true;
		isReverseX=true;
		isReverseY=false;
	}
	tempStdev=this.stdev(true,true,true);
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=true;
		isReverseX=true;
		isReverseY=true;
	}
	if (isSwapXY) {this.swapMeasXY();}
	if (isReverseX) {this.reverseMeasX();}
	if (isReverseY) {this.reverseMeasY();}
	return {swapXY:isSwapXY,reverseMeasX:isReverseX,reverseMeasY:isReverseY};
}

//清空数据
Points.prototype.clearData=function (){
	this.name="";
	this.points=new Array();
}



/*
	以下为用到的函数
*/

//比较数组中是否已经含有目标值
Array.prototype.inArray=function(t){
	var i=0;
	while (i<this.length){
		if (this[i]===t) {return i;}
		i++;
	}
	return -1;	//未找到
}

//将数据保留至指定位小数
function roundTo(num,n){
	if(n===undefined){n=4;}
	var temp=Math.pow(10,n);
	return Math.round(num*temp)/temp;
}



/*
var o=new Points('test');
o.addPoint(true,'a',10,5,-5,-10);
alert(JSON.stringify(o.autoFitAxis()));
alert(JSON.stringify(o));
*/