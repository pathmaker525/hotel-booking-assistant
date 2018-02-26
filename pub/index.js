$(function(){

  //initialization
  updateScroll();

  $(window).on('scroll',function(e){
    updateScroll();
  })

  $('.carouselHide').on('click',function(e){
    hideCarousel();
  })

  var promoSlider = new KiwwwiSlider(document.querySelectorAll('#slider')[0], 3000, 1);

});

function updateScroll(){
  var scroll = $(window).scrollTop();
  console.log(scroll);
  if(scroll <= 100){

    $('.titleWelcome').css('visilibity','hidden');
    $('.navLogo').css('display','none');
    $('.navBar').addClass('navBarScrollUp');
  }else{
    //do not mix .css with .hide -> it causes 'easing error'
    $('.titleWelcome').css('visibility','visible');
    $('.navLogo').css('display','inline');
    $('.navBar').removeClass('navBarScrollUp');
  }
}

function hideCarousel(){
  $('.container').css('visibility','hidden');
  $('.carouselHide').css('visibility','hidden');
  $('.slide-left').css('display','none');
  $('.slide-right').css('display','none');
}