require(["math","user"], function(math,user) {
  if(user.checkLogin("xxx","yyz")){
    console.log("12+21=" + math.add(12,21));
  }else{
    console.log('please sign in or register first');
  }
})