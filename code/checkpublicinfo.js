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

  console.log(departurePoint)
  console.log('latitude: ')
  console.log(departurePoint.point.latitude)
  console.log('longitude: ')
  console.log(departurePoint.point.longitude)

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
  for(var i=0; i<3;i++){
    if(sortArray[i][0]<20){
      departTerminalName.push(sortArray[i][1])
    }
  }
  console.log(departTerminalName)
  
  var getTrminlCode='http://openapi.tago.go.kr/openapi/service/SuburbsBusInfoService/getSuberbsBusTrminlList?serviceKey=4jdPRNRDm85%2FTOPw8hCSxu1XqZJpy%2BK%2BJOe7q%2BPdwkMgiuTT%2BUslWghej6U1go%2Baxig8H5Gf%2FWWAkLZryohhow%3D%3D&terminalNm=',  
      trialDesCode='NAI252600075'; //강릉

  var departTrminlCode=[]
  for(var i=0;i<3;i++){ //터미널 코드 얻기
    var linkTrminlCode=getTrminlCode+encodeURIComponent(departTerminalName[i]);
    // console.log(linkTrminlCode) //링크만들음
    var responseTrminlCode=http.getUrl(linkTrminlCode, {format: 'xmljs'})
    // console.log(responseTrminlCode)
    departTrminlCode.push(responseTrminlCode.response.body.items.item.terminalId)
  }
  console.log(departTrminlCode)

  // 일단 현재시간으로 설정
  var nowZone=new dates.ZonedDateTime.now(),
      now = nowZone.getDateTime()
      timeString=String(now.date.year)+String(now.date.month)+String(now.date.day);

  console.log(timeString)
  // 개발계정이라 요즘 날짜가 안뜨나보다.
  timeString='20161001'

  // 지금 서울에서 대전으로 출발하는 차 얻기
  var findBusInfo='http://openapi.tago.go.kr/openapi/service/SuburbsBusInfoService/getStrtpntAlocFndSuberbsBusInfo?serviceKey=4jdPRNRDm85%2FTOPw8hCSxu1XqZJpy%2BK%2BJOe7q%2BPdwkMgiuTT%2BUslWghej6U1go%2Baxig8H5Gf%2FWWAkLZryohhow%3D%3D&numOfRows=10&pageNo=1&'

  for(var i=0;i<3;i++){
    var linkBusInfo=findBusInfo+'depTerminalId='+departTrminlCode[i]+'&arrTerminalId='+trialDesCode+'&depPlandTime='+timeString,
        responseBusInfo=http.getUrl(linkBusInfo, {format: 'xmljs'});
    //depTerminalId=NAI104600001&arrTerminalId=NAI252600075&depPlandTime=20161001&busGradeId=5
    console.log(responseBusInfo)
  }






    


  return {
    departurePoint: departurePoint,
    destinationPoint: destinationPoint
  }
}