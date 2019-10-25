module.exports.function = function checkpublicinfo (departurePoint, destinationPoint, publicType, time, cost, available) {
  //현재 해결해야 할 점:
  // 해당하는 대중교통이 몇 종류인지 모르는 상황인데, 어떻게 가져오려는 시도를 하고, 저장해서, 리턴할 것인가?
  // 이를 위해서는 API를 뜯어봐야 할 것 같다.
  // 
  // 뜯어봤고
  // 가까운 정류장을 찾기 위해 API를 하나 더 만들어야 ㅎ할까/ geo를 찾아보자. 
  
  var console=require('console'),
      http=require('http'),
      dates=require('dates');

  console.log(destinationPoint)
  console.log('latitude: ')
  console.log(departurePoint.point.latitude)
  console.log('longitude: ')
  console.log(departurePoint.point.longitude)

  // var sY= departurePoint.point.latitude,
  //     sX= departurePoint.point.longitude,
  //     eY= destinationPoint.point.latitude,
  //     eX= destinationPoint.point.longitude;
    
  // console.log(http.getUrl(url, {format: 'xmljs'}))

  // 환승 api test code
	// var url = "https://api.odsay.com/v1/api/searchPubTransPath?SX="+sX+"&SY="+sY+"&EX="+eX+"&EY="+eY+"&apiKey=sRoBDwzo/Sk1GRkUYI9zdw";
  var url1="https://api.odsay.com/v1/api/intercityServiceTime?lang=0&startStationID=3600750&endStationID=3600938&apiKey=ramBlYRtvsTstJnTkrSqLF46psg5XZgiOFkNoERqngc"
  console.log(http.getUrl(url1, {format: 'json'})) 
  // var preUrl="https://api.odsay.com/v1/api/searchPubTransPathR?lang=0&SX=",
  //     url = preUrl+sX+"&SY="+sY+"&EX="+eX+"&EY="+eY+"&apiKey="+encodeURI('ramBlYRtvsTstJnTkrSqLF46psg5XZgiOFkNoERqngc');
  // console.log(url);
  // console.log(http.getUrl(url, {format: 'json'}));


  var pointTable= require('./pointtable.js').table,
      distanceTable={}

  function getDistanceFromLatLonInKm(lat1,lng1,lat2,lng2) { //거리 구하는 함수
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lng2-lng1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

  console.log(pointTable['시외버스']['동서울'])
  console.log(getDistanceFromLatLonInKm(36.5, 127, 36.6, 127.1))

//시외버스 부분 코드 시작
  for(var key in pointTable['시외버스']){ //표 돌면서 거리계산하여 배열에 저장
    if(pointTable['시외버스'].hasOwnProperty(key)){
      var val=pointTable['시외버스'][key];
      // console.log(departurePoint.point.latitude)
      var a=departurePoint.point.latitude,
          b=departurePoint.point.longitude,
          c=val[0],
          d=val[1];
      // console.log(getDistanceFromLatLonInKm(departurePoint.point.latitude, departurePoint.point.logitude, val[0], val[1]))
      // console.log(getDistanceFromLatLonInKm(a, b, c, d)) 왜 이렇게 해야하지 ㅋㅋㅋ
      console.log(key)
      var keyname='',
          postfix=key;

      distanceTable[key]=getDistanceFromLatLonInKm(a, b, c, d)
    }
  }

  console.log(distanceTable)

  var sortArray=[],
      sortResultArray=[];

  for(var key in distanceTable){
    sortArray.push([distanceTable[key], key])
  }
  sortArray.sort()//거리에 따라 정렬. 근데 9킬로짜리 왜 뒤로 갔지?
  console.log(sortArray) 
  console.log(sortArray[0][1])

  var departTerminalName=[]; // 20킬로 내의 정류장 4개 추가!
  for(var i=0; i<4;i++){
    if(sortArray[i][0]<20){
      departTerminalName.push([sortArray[i][1], sortArray[i][0]])
    }
  }
  console.log(departTerminalName)
  
  var getTrminlCode='http://openapi.tago.go.kr/openapi/service/SuburbsBusInfoService/getSuberbsBusTrminlList?serviceKey=4jdPRNRDm85%2FTOPw8hCSxu1XqZJpy%2BK%2BJOe7q%2BPdwkMgiuTT%2BUslWghej6U1go%2Baxig8H5Gf%2FWWAkLZryohhow%3D%3D&terminalNm=',  
      trialDesCode=['NAI252600075', 'NAI267600114']; //강릉, 양양

  var departTrminlCode=[]
  for(var i=0;i<departTerminalName.length;i++){ //터미널 코드 얻기
    var linkTrminlCode=getTrminlCode+encodeURIComponent(departTerminalName[i][0]);
    // console.log(linkTrminlCode) //링크만들음
    var responseTrminlCode=http.getUrl(linkTrminlCode, {format: 'xmljs'})
    // console.log(responseTrminlCode)
    departTrminlCode.push([responseTrminlCode.response.body.items.item.terminalId, departTerminalName[i][1]]) //거리정보도 저장
  }
  console.log(departTrminlCode)

  // 일단 현재시간으로 설정
  var nowZone=new dates.ZonedDateTime.now(),
      now = nowZone.getDateTime()
      timeString=String(now.date.year)+String(now.date.month)+String(now.date.day);

  console.log(now)
  console.log(timeString)
  // 개발계정이라 요즘 날짜가 안뜨나보다.
  timeString='20161001'

  // 지금 서울에서 대전으로 출발하는 차 얻기
  var findBusInfo='http://openapi.tago.go.kr/openapi/service/SuburbsBusInfoService/getStrtpntAlocFndSuberbsBusInfo?serviceKey=4jdPRNRDm85%2FTOPw8hCSxu1XqZJpy%2BK%2BJOe7q%2BPdwkMgiuTT%2BUslWghej6U1go%2Baxig8H5Gf%2FWWAkLZryohhow%3D%3D&numOfRows=10&pageNo=1&'

  var publicResultArray=[]

  //그림 정하기
  var filename= '/images/bus.jpg'

  for(var i=0;i<departTrminlCode.length;i++){
    for(var j=0;j<trialDesCode.length;j++){
      var timeInfoArray=[]
      var linkBusInfo=findBusInfo+'depTerminalId='+departTrminlCode[i][0]+'&arrTerminalId='+trialDesCode[j]+'&depPlandTime='+timeString,
          responseBusInfo=http.getUrl(linkBusInfo, {format: 'xmljs'});
      //depTerminalId=NAI104600001&arrTerminalId=NAI252600075&depPlandTime=20161001&busGradeId=5
      console.log(responseBusInfo)
      
      // 있는 노선인지 확인
      if(responseBusInfo.response.body.items.item != undefined){ //여기서 리턴할 형태로 처리해보자.
        var responseItem= responseBusInfo.response.body.items.item
        // console.log(responseItem.length)
        function convertNumTime(num1){ 
            var num=String(num1);
            var year=num.substr(0,4),
                month=String(num.substr(4,2)-1),
                day=num.substr(6,2),
                hour=num.substr(8,2),
                min=num.substr(10,2);
            // ZonedDateTime date=new dates.ZonedDateTime.of(year, month, day, hour, min, 0, 0, ZoneId.of("Asia/Seoul"));
            var time=new Date(year, month, day, hour, min, 0, 0)
            // console.log(month, day, hour, min)
            return time
        } 

        function drivingTime(arr, dep){ // 걸리는 시간을 구하는 함수
          
          var driving= (convertNumTime(arr) - convertNumTime(dep))/60000;
          var drivingMin=driving%60
          return parseInt(driving/60)+'시간 '+drivingMin+'분'
        }
        //시간스트링 얻는함수

        // function timeString(t){
        //   return t.time.hour+":"+t.time.minute;
        // }
        // console.log(drivingTime(201610011450, 201610011200))

        // console.log(drivingTime(responseItem[0].arrPlandTime, responseItem[0].depPlandTime))

        if(responseItem.length!=undefined){ // 결과 데이터 추가!! 
          for(var k=0;k<responseItem.length;k++){ //일단 전부다 추가하기로 하고,
            timeInfoArray.push({
              departTime: responseItem[k].depPlandTime.substr(8,2)+":"+responseItem[k].depPlandTime.substr(10,2),
              arriveTime: responseItem[k].arrPlandTime.substr(8,2)+":"+responseItem[k].arrPlandTime.substr(10,2),
              drivingTime: drivingTime(responseItem[k].arrPlandTime, responseItem[k].depPlandTime),
              busGrade: responseItem[k].gradeNm,
              charge: responseItem[k].charge
            });
          }

          publicResultArray.push({
            departureName: responseItem[0].depPlaceNm,
            destinationName: responseItem[0].arrPlaceNm,
            timeStructure: timeInfoArray,
            // publicType: publicType,
            filename: filename,
            distance: departTrminlCode[i][1]
          }
          );
        }else{ //한개일때
          timeInfoArray.push({
              departTime: responseItem.depPlandTime.substr(8,2)+":"+responseItem.depPlandTime.substr(10,2),
              arriveTime: responseItem.arrPlandTime.substr(8,2)+":"+responseItem.arrPlandTime.substr(10,2),
              drivingTime: drivingTime(responseItem.depPlandTime, responseItem.arrPlandTime),
              busGrade: responseItem.gradeNm,
              charge: responseItem.charge
          })
          publicResultArray.push({
            departureName: responseItem.depPlaceNm,
            destinationName: responseItem.arrPlaceNm,
            // grade: responseItem.gradeNm,
            timeStructure: timeInfoArray,
            filename: filename,
            distance: departTrminlCode[i][1]
          });
        }
        
      }
    }
  }
  

  console.log(publicResultArray)

  // 결과 저장할 array








    


  return {
    departurePoint: departurePoint, //일단 포인트 리턴하자!
    destinationPoint: destinationPoint,
    publicResultStructure: publicResultArray,
    // filename: filename 
  }
}
