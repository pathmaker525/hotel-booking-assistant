$(function(){

  AOS.init({
    duration: 1200,
  })

  $('.navLogo').hide();

  $(window).on('scroll',function(e){
    var scroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    
    console.log(scroll);
    
    if(scroll >= 100){
      $('.titleWelcome').hide();
      $('.navLogo').css('display','inline');
      $('.navBar').addClass(['scrolled','scrolledshadow']);
      $('.navli').css('color','black');
  
    }else{
      $('.titleWelcome').show();
      $('.navLogo').css('display','none');
      $('.navBar').removeClass(['scrolled','scrolledshadow']);
      $('.navli').css('color','white');
    }
  })
  
  $(".owl-carousel").owlCarousel({
    items:1,
    center:true,
    loop:true,
    autoWidth:true,
    autoplay:true,
    autoPlaySpeed:5000,
    autoplayTimeout:1000,
    autoplayHoverPause:true
  });

});

function openNav() {
  $("#mySidenav").css('width', '250px');
}

function closeNav() {
  $("#mySidenav").css('width','0');
}