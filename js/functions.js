
//定义数据点对象Point
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
	.shiftSpecPos({x,y})				平移设计坐标的坐标原点
	.shiftMeasPos({x,y})				平移量测坐标的坐标原点
	.swapMeasXY()						将量测坐标的X,Y进行交换
*/
function Point(data){
	this.isScale=Boolean(data.isScale);
	this.name=String(data.name);
	this.specX=Number(data.specX || 0);
	this.specY=Number(data.specY || 0);
	this.measX=Number(data.measX || 0);
	this.measY=Number(data.measY || 0);
	this.scaleX=Number(data.scaleX || 1);
	this.scaleY=Number(data.scaleY || 1);
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
Point.prototype.shiftSpecPos=function (shift){
	if (shift.x) {this.specX=this.specX-shift.x;}
	if (shift.y) {this.specY=this.specY-shift.y;}
}

//平移量测坐标的坐标原点
Point.prototype.shiftMeasPos=function (shift){
	if (shift.x) {this.measX=this.measX-shift.x;}
	if (shift.y) {this.measY=this.measY-shift.y;}
}

//将量测坐标的X,Y进行交换
Point.prototype.swapMeasXY=function (){
	var temp=this.measX;
	this.measX=this.measY;
	this.measY=temp;
}

//定义数据点组合对象Points
/*
	.points								保存Point对象的Array
	.name								数据点组的名称字符串
	.addPoint({isScale,name,specX,specY,measX,measY,scaleX,scaleY})
										增加数据点，参数格式同Point对象
	.clone()							返回一个复制的数据点组
	.shiftSpecPos({x,y})				平移标准坐标原点
	.shiftMeasPos({x,y})				平移量测坐标原点
	.specPosShift.x						平移标准坐标原点时保存的X轴偏移量
	.specPosShift.y						平移标准坐标原点时保存的Y轴偏移量
	.measPosShift.x						平移量测坐标原点时保存的X轴偏移量
	.measPosShift.y						平移量测坐标原点时保存的Y轴偏移量
	.autoShift()						平移标准坐标与量测坐标的原点至各自的重心
	.swapMeasXY()						将量测坐标的X,Y进行交换
	.reverseMeasX()						将量测坐标的X轴反转
	.reverseMeasY()						将量测坐标的Y轴反转
	.setIsScale(isScale)				将所有数据点统一设置是否缩放
	.setScale({x,y})					将所有数据点统一设置拉伸系数
	.splitBy(propertyName)				将数据按照属性名称进行分组,对应属性的值会被保存到数据点组的name属性
	.calcRotation()						计算当量测坐标与设计坐标位置最接近时的旋转角度
	.rotateMeasPos(radian)				对量测坐标进行角度旋转
	.calcStatistics()					计算数据点组的统计结果,包括最大最小及平均值
	.calcStdev({swapXY,reverseX,reverseY})
										计算数据点组的标准差
	.calcScaleFactor()					计算平均涨缩系数
	.autoFitAxis()						自动将量测坐标与标准坐标的坐标系方向进行匹配
	.autoRotate()						自动将量测坐标旋转至与设计坐标位置最接近时的角度
	.clearData(name)					清空数据,name为清空后新的名称
	.output()							将数据输出为highchart图表数据格式
*/
function Points(name){
	this.points=new Array();
	this.name=new String(name);
	this.specPosShift={x:0,y:0};
	this.measPosShift={x:0,y:0};
	return this;
}

//增加数据点
Points.prototype.addPoint=function (data){
	this.points.push(new Point(data));
	return this;
}

//返回一个复制的数据点组
Points.prototype.clone=function (){
	var copyPoints=new Points(this.name);
	copyPoints.specPosShift.x=this.specPosShift.x;
	copyPoints.specPosShift.y=this.specPosShift.y;
	copyPoints.measPosShift.x=this.measPosShift.x;
	copyPoints.measPosShift.y=this.measPosShift.y;
	for (var i=0;i<this.points.length;i++){
		copyPoints.addPoint({
			isScale:this.points[i].isScale,
			name:this.points[i].name,
			specX:this.points[i].specX,
			specY:this.points[i].specY,
			measX:this.points[i].measX,
			measY:this.points[i].measY,
			scaleX:this.points[i].scaleX,
			scaleY:this.points[i].scaleY
		});
	}
	return copyPoints;
}

//平移标准坐标的坐标原点
Points.prototype.shiftSpecPos=function (shift){
	for (var i=0;i<this.points.length;i++){
		if (shift.x) {
			this.points[i].specX=this.points[i].specX-shift.x;
			this.specPosShift.x=shift.x;
		}
		if (shift.y) {
			this.points[i].specY=this.points[i].specY-shift.y;
			this.specPosShift.y=shift.y;
		}
	}
	return this;
}

//平移量测坐标的坐标原点
Points.prototype.shiftMeasPos=function (shift){
	if (shift.x) {
		for (var i=0;i<this.points.length;i++){
			this.points[i].measX=this.points[i].measX-shift.x;
		}
		this.measPosShift.x=shift.x;
	}
	if (shift.y) {
		for (var i=0;i<this.points.length;i++){
			this.points[i].measY=this.points[i].measY-shift.y;
		}
		this.measPosShift.y=shift.y;
	}
	return this;
}


//平移标准坐标与量测坐标的原点至各自的重心
Points.prototype.autoShift=function (){
	var stat=this.calcStatistics();
	var shift=new Object();
	if (stat.avgSpecX!=null && stat.avgSpecY!=null) {
		shift.specShift={x:stat.avgSpecX,y:stat.avgSpecY};
	}else{
		shift.specShift={x:0,y:0};
	}
	if (stat.avgMeasX!=null && stat.avgMeasY!=null) {
		shift.measShift={x:stat.avgMeasX,y:stat.avgMeasY};
	}else{
		shift.measShift={x:0,y:0};
	}
	this.shiftSpecPos(shift.specShift);
	this.shiftMeasPos(shift.measShift);
	return shift;
}

//将量测坐标的X,Y进行交换
Points.prototype.swapMeasXY=function (){
	for (var i=0;i<this.points.length;i++){
		this.points[i].swapMeasXY();
	}
	var temp=this.measPosShift.x;
	this.measPosShift.x=this.measPosShift.y;
	this.measPosShift.y=temp;
	return this;
}

//将量测坐标的X轴反转
Points.prototype.reverseMeasX=function (){
	for (var i=0;i<this.points.length;i++){
		this.points[i].measX *= -1;
	}
	this.measPosShift.x *= -1;
	return this;
}

//将量测坐标的Y轴反转
Points.prototype.reverseMeasY=function (){
	for (var i=0;i<this.points.length;i++){
		this.points[i].measY *= -1;
	}
	this.measPosShift.y *= -1;
	return this;
}

//统一设置是否拉伸坐标
Points.prototype.setIsScale=function (isScale){
	for (var i=0;i<this.points.length;i++){
		this.points[i].isScale=Boolean(isScale);
	}
	return this;
}

//统一设置拉伸系数
Points.prototype.setScale=function (scale){
	for (var i=0;i<this.points.length;i++){
		if(scale.x){
			this.points[i].scaleX=Number(scale.x);
		}
		if(scale.y){
			this.points[i].scaleY=Number(scale.y);
		}
	}
	return this;
}

//将数据按照属性名称进行分组,对应属性的值会被保存到数据点组的name属性
Points.prototype.splitBy=function (propertyName){
	var tempPointsArr=new Array();
	var tempNameArr=new Array();
	var tempName,tempID,tempOption,tempObj;
	for (var i=0;i<this.points.length;i++){
		tempName=this.points[i][propertyName].toString();
		tempID=tempNameArr.inArray(tempName);
		tempOption={
			isScale:this.points[i].isScale,
			name:this.points[i].name,
			specX:this.points[i].specX,
			specY:this.points[i].specY,
			measX:this.points[i].measX,
			measY:this.points[i].measY,
			scaleX:this.points[i].scaleX,
			scaleY:this.points[i].scaleY
		};
		if (-1===tempID){
			tempNameArr.push(tempName);
			tempObj=tempPointsArr[tempPointsArr.push(new Points(tempName))-1].addPoint(tempOption);
			tempObj.specPosShift.x=this.specPosShift.x;
			tempObj.specPosShift.y=this.specPosShift.y;
			tempObj.measPosShift.x=this.measPosShift.x;
			tempObj.measPosShift.y=this.measPosShift.y;
		}else{
			tempPointsArr[tempID].addPoint(tempOption);
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
	tempX=this.measPosShift.x;
	tempY=this.measPosShift.y;
	this.measPosShift.x=tempX * Math.cos(radian) - tempY * Math.sin(radian);
	this.measPosShift.y=tempX * Math.sin(radian) + tempY * Math.cos(radian);
	return this;
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
	result.avgMeasY /= this.points.length;
	return result;
}

//计算数据点组的标准差
Points.prototype.calcStdev=function (transform){
	var measX,measY,s=0;
	for (var i=0;i<this.points.length;i++){
		measX=transform.swapXY?(transform.reverseX?-this.points[i].measY:this.points[i].measY):(transform.reverseX?-this.points[i].measX:this.points[i].measX);
		measY=transform.swapXY?(transform.reverseY?-this.points[i].measX:this.points[i].measX):(transform.reverseY?-this.points[i].measY:this.points[i].measY);
		if (this.points[i].isScale==true){
			s+=Math.pow(measX-this.points[i].specX*this.points[i].scaleX,2)+Math.pow(measY-this.points[i].specY*this.points[i].scaleY,2);
		}else{
			s+=Math.pow(measX-this.points[i].specX,2)+Math.pow(measY-this.points[i].specY,2);
		}
	}
	return Math.sqrt(s);
}

//计算平均涨缩系数
Points.prototype.calcScaleFactor=function (threshold){
	threshold=threshold || 0.2;
	threshold=Math.abs(threshold);
	var stat=this.calcStatistics();
	var thresholdX=(stat.maxSpecX-stat.minSpecX)*threshold;
	var thresholdY=(stat.maxSpecY-stat.minSpecY)*threshold;
	var tempX=tempY=countX=countY=0;
	var tempPoint;
	for (var i=0;i<this.points.length;i++){
		tempPoint=this.points[i];
		if (tempPoint.isScale==true){
			if (Math.abs(tempPoint.specX)>thresholdX && tempPoint.measX/tempPoint.specX>0) {
				tempX+=tempPoint.measX/tempPoint.specX;
				countX+=1;
			}
			if (Math.abs(tempPoint.specY)>thresholdY && tempPoint.measY/tempPoint.specY>0) {
				tempY+=tempPoint.measY/tempPoint.specY;
				countY+=1;
			}
		}
	}
	return {
		x : (countX>1 ? tempX/countX : null),
		y : (countY>1 ? tempY/countY : null),
		countX : countX,
		countY : countY
	};
		
}

//自动将量测坐标与标准坐标的坐标系方向进行匹配
Points.prototype.autoFitAxis=function (){
	var isSwapXY=false,isReverseX=false,isReverseY=false;
	var tempStdev,minStdev;
	minStdev=this.calcStdev({});
	tempStdev=this.calcStdev({reverseY:true});
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=false;
		isReverseX=false;
		isReverseY=true;
	}
	tempStdev=this.calcStdev({reverseX:true});
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=false;
		isReverseX=true;
		isReverseY=false;
	}
	tempStdev=this.calcStdev({reverseX:true,reverseY:true});
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=false;
		isReverseX=true;
		isReverseY=true;
	}
	tempStdev=this.calcStdev({swapXY:true});
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=true;
		isReverseX=false;
		isReverseY=false;
	}
	tempStdev=this.calcStdev({swapXY:true,reverseY:true});
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=true;
		isReverseX=false;
		isReverseY=true;
	}
	tempStdev=this.calcStdev({swapXY:true,reverseX:true});
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=true;
		isReverseX=true;
		isReverseY=false;
	}
	tempStdev=this.calcStdev({swapXY:true,reverseX:true,reverseY:true});
	if (tempStdev<minStdev){
		minStdev=tempStdev;
		isSwapXY=true;
		isReverseX=true;
		isReverseY=true;
	}
	if (isSwapXY) {this.swapMeasXY();}
	if (isReverseX) {this.reverseMeasX();}
	if (isReverseY) {this.reverseMeasY();}
	return {swapXY:isSwapXY,reverseX:isReverseX,reverseY:isReverseY};
}

//自动将量测坐标旋转至与设计坐标位置最接近时的角度
Points.prototype.autoRotate=function (){
	var rotation=this.calcRotation();
	this.rotateMeasPos(rotation);
	return rotation;
}

//清空数据
Points.prototype.clearData=function (name){
	this.name=new String(name || "");
	this.shiftSpecPos={x:0,y:0};
	this.shiftMeasPos={x:0,y:0};
	this.points=new Array();
	return this;
}

//将数据输出为highchart图表数据格式
Points.prototype.output=function (zoom,shift){
	if (shift==undefined) {shift=true;}
	var tempData={
		name: this.name,
		marker: {
			symbol: 'circle',
			lineWidth:1,
			radius:2
		},
		data : new Array()
	};
	var tempPoint,tempName;
	for (var i=0;i<this.points.length;i++){
		tempPoint=this.points[i];
 		if (shift){
			tempName=' [' + (i+1) + ']</b></span><br><span style="color:#006600"><b>标准X:</b></span>'+roundTo(tempPoint.specX+this.specPosShift.x)+'<span style="color:#006600"><br><b>标准Y:</b></span>'+roundTo(tempPoint.specY+this.specPosShift.y)+'<span style="color:#660000"><br><b>偏差X:</b></span>'+roundTo(tempPoint.biasX())+'<br><span style="color:#660000"><b>偏差Y:</b></span>'+roundTo(tempPoint.biasY())+'<span style="color:#660000"><br><b>偏差D:</b></span>'+roundTo(Math.sqrt(Math.pow(tempPoint.biasX(),2)+Math.pow(tempPoint.biasY(),2)));
			tempData.data.push({
				name:tempName,
				marker:{enable:true,radius:4},
				x:(tempPoint.specX+this.specPosShift.x),
				y:(tempPoint.specY+this.specPosShift.y)
			});
			tempData.data.push({
				name:tempName,
				marker:{enable:false,radius:0},
				x:(tempPoint.biasX(zoom)+tempPoint.specX+this.specPosShift.x),
				y:(tempPoint.biasY(zoom)+tempPoint.specY+this.specPosShift.y)
			});
		}else{
			tempName=' [' + (i+1) + ']</b></span><br><span style="color:#006600"><b>标准X:</b></span>'+roundTo(tempPoint.specX)+'<br><span style="color:#006600"><b>标准Y:</b></span>'+roundTo(tempPoint.specY)+'<br><span style="color:#660000"><b>偏差X:</b></span>'+roundTo(tempPoint.biasX())+'<br><span style="color:#660000"><b>偏差Y:</b></span>'+roundTo(tempPoint.biasY())+'<span style="color:#660000"><br><b>偏差D:</b></span>'+roundTo(Math.sqrt(Math.pow(tempPoint.biasX(),2)+Math.pow(tempPoint.biasY(),2)));
			tempData.data.push({
				name:tempName,
				marker:{enable:true,radius:4,lineWidth:0},
				x:tempPoint.specX,
				y:tempPoint.specY
			});
			tempData.data.push({
				name:tempName,
				marker:{enable:false,radius:0,lineWidth:0},
				x:(tempPoint.biasX(zoom)+tempPoint.specX),
				y:(tempPoint.biasY(zoom)+tempPoint.specY)
			});
		}
		tempData.data.push(null);
	}
	return tempData;
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

//将数据四舍五入至指定小数位数
function roundTo(num,n){
	if(n===undefined){n=4;}
	var temp=Math.pow(10,n);
	return Math.round(num*temp)/temp;
}
