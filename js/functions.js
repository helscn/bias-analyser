function transArr(arr,spec,n,scale){
	if(n===undefined){n=4;}
	spec=spec || 0;
	scale=scale || 1;
	var newArr=new Array();
	var temp=Math.pow(10,n);
	for (var i=0;i<arr.length;i++){
		newArr.push(Math.round((arr[i]-spec)*scale*temp)/temp);
	}
	return newArr;
}

//将数据保留至指定位小数
function roundTo(num,n,scale){
	if(n===undefined){n=4;}
	scale=scale || 1;
	num*=scale;
	var temp=Math.pow(10,n);
	return Math.round(num*temp)/temp;
}

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
*/
function Point(isScale,name,specX,specY,measX,measY,scaleX,scaleY){
	this.isScale=new Boolean(isScale);
	this.name=new String(markName);
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
	this.measX=this.measY-shiftX;
	this.measY=this.measY-shiftY;
}

//定义数据点组合对象
/*
	.points								保存Point对象的Array
	.name								数据点组的名称字符串
	.moveSpecPos(shiftX,shiftY)			平移标准坐标原点
	.moveMeasPos(shiftX,shiftY)			平移量测坐标原点
	.setIsScale(isScale)				将所有数据点统一设置是否缩放
	.setScale(scaleX,scaleY)			将所有数据点统一设置拉伸系数
	.splitBy(propertyName)				将数据按照属性名称进行分组,对应属性的值会被保存到数据点组的name属性
*/
function Points(name){
	this.points=new Array();
	this.name=new String(name);
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

//统一设置是否拉伸坐标
Points.prototype.setIsScale=function (isScale){
	for (var i=0;i<this.points.length;i++){
		this.points[i].isScale=new Boolean(isScale);
	}
}

//统一设置拉伸系数
Points.prototype.setScale=function (scaleX,scaleY){
	for (var i=0;i<this.points.length;i++){
		if(scaleX!==undefined){
			this.points[i].scaleX=new Number(scaleX);
		}
		if(scaleY!==undefined){
			this.points[i].scaleY=new Number(scaleY);
		}
	}
}

//将数据按照属性名称进行分组,对应属性的值会被保存到数据点组的name属性
Points.prototype.splitBy(propertyName){
	var tempArr=new Array();
	
}


//比较数组中是否已经含有目标值
Array.prototype.include=function(t){
	var i=0;
	while (i<this.length){
		if(this[i]===t){return true;}
		i++;
	}
	return false;
}

