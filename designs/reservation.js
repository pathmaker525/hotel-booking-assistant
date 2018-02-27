$(function(){
  $('#datepicker').datepicker({
    orientation:'bottom'
  });

  $('#roomSelect').selectize({
    create: true
  });

  $('#familySize').selectize({
    create: true
  });

  $('#specialRequest').selectize({
    plugins:['remove_button'],
    delimiter: ',',
    persist: false,
    valueField:'value',
    labelField:'label',
    options:[
      {'label':'조식 추가(추가비용+)', 'value':'breakfast'},
      {'label':'중식 추가(추가비용+)', 'value':'lunch'},
      {'label':'인원 추가', 'value':'addperson'},
      {'label':'침대 추가(추가비용+)','value':'extrabed'},
      {'label':'오후 2시 이전 체크인(추가비용+)','value':'earlyci'},
      {'label':'오후 12시 이후 체크인(추가비용+)','value':'lateco'},
      {'label':'기업체', 'value':'company'},
      {'label':'단체','value':'group'},
      {'label':'외국인 고객','value':'foreign'}
    ],
    create: function(input) {
      return {
        value: input,
        text: input
      }
    }
  });
});