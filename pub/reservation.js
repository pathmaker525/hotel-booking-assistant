$(function(){
  $('.form-control').on('click',function(){
    $('#datepicker').show();
  });

  $('#datepicker').datepicker({
    orientation:'bottom'
  });

  $('#roomSelect').selectize({
    create: true
  });

  $('#familySize').selectize({
    create: true
  });

  $('#packageDeal').selectize({
    create: true
  });

  $('#specialRequest').selectize({
    plugins:['remove_button'],
    delimiter: ',',
    persist: false,
    valueField:'value',
    labelField:'label',
    options:[
      {'label':'조식 추가(추가비용+)', 'value':'조식추가'},
      {'label':'중식 추가(추가비용+)', 'value':'중식추가'},
      {'label':'인원 추가', 'value':'인원추가'},
      {'label':'침대 추가(추가비용+)','value':'엑스트라베드 세팅'},
      {'label':'오후 2시 이전 체크인(추가비용+)','value':'Early C/I'},
      {'label':'오후 12시 이후 체크인(추가비용+)','value':'Late C/O'},
      {'label':'기업체', 'value':'기업체'},
      {'label':'단체','value':'단체'},
      {'label':'외국인 고객','value':'외국인 고객'}
    ],
    create: function(input) {
      return {
        value: input,
        text: input
      }
    }
  });
});