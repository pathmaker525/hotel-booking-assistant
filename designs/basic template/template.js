$(function(){

  AOS.init({
    duration: 1200,
  })

});

function openNav() {
  $("#mySidenav").css('width', '250px');
}

function closeNav() {
  $("#mySidenav").css('width','0');
}