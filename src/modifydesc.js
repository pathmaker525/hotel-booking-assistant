import React from 'react'
import ReactDOM from 'react-dom'

import moment from 'moment'
import request from 'superagent'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import {BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom'
import SelectField from 'material-ui/SelectField'

import ImageUpload from './imageup.js'

//------------------- description edit page
export default class ModifyDesc extends React.Component {
  constructor(props){
    super(props)
    this.state={
      goback:false,
      descdata:{
        title:"",
        context:"",
        dateedit:moment(),
        category:2, // 0 - typical desc w/o image, 1 - typical desc w/image, 2 - sightseeing(with details) , 3 - gastronomy
        image:"",
        extra:"",
        weblink:"",
        maplink:""
      },
      imagedata:""
    }
    this.sendBack = this.sendBack.bind(this)
    this.updateContent = this.updateContent.bind(this)
    this.confirmModify = this.confirmModify.bind(this)
    this.updateImage = this.updateImage.bind(this)
    this.delete = this.delete.bind(this)
  }

  sendBack(e){
    e.preventDefault()
    this.setState({goback:true})
  }

  componentDidMount(){

    if(this.props.createnew){
      //create new value
      console.log('creating new element...')
      //USUALLY any datas can be accessed from outside are referred from 'props'
      //하지만 기존 자료를 읽어들일 때에는 desc로만 처리되고 카테고리를 알 수 없는 상태에서
      //db로 바로 자료를 읽어와야 하므로 카테고리는 props로 처리하지 않고 state에 집어넣는다
      this.state.descdata.category=this.props.category
      this.forceUpdate()
    }else{
      //load up existing data to modify
      console.log('loading up details...')
      request.get('/queryJSON')
      .query({
        type:"descdetail",
        targetid:this.props.targetid
      })
      .end((err,data)=>{
        console.log("detail data fetch completed:",data.body.querydescdetail)
        this.setState({descdata:data.body.querydescdetail})
      })
    }

  }

  updateContent(e){
    this.state.descdata[e.target.name] = e.target.value
    this.forceUpdate()
  }

  confirmModify(){
    this.state.descdata.dateedit = moment().format('YYYY-MM-DD')

    request.post('/modwimg')
    .query({
      token:this.props.token,
      targetid:this.props.targetid,
      createnew:this.props.createnew,
      type:'desc'
    })
    .accept('application/json')
    .field('data',JSON.stringify(this.state.descdata))
    .attach('image',this.state.imagedata)
    .then((res)=>{
      console.log('upload finished')
      this.setState({goback:true})
    })
    .catch((err)=>{

    })

  }

  delete(){
    request.get('/delete')
    .query({
      targetid:this.props.targetid,
      token:this.props.token,
      dbtype:'descs'
    })
    .end((err,data)=>{
      if(data.body.result){
        alert('성공적으로 내용을 삭제했습니다')
        this.setState({goback:true})
      }
    })
  }


  updateImage(imgfile){
    this.setState({imagedata:imgfile})
  }

  render(){
    const category = ['설명(사진 없음)', '설명(사진 포함)', '인근 관광명소 정보', '인근 맛집 정보']
    const extrainfo = (
      <div>
        <TextField floatingLabelText="제목" value={this.state.descdata.title} onChange={this.updateContent} fullWidth={true} name="title" />
        <TextField floatingLabelText="위치 및 연락처" value={this.state.descdata.extra} onChange={this.updateContent} fullWidth={true} name="extra" />
        <TextField floatingLabelText="지도 링크" value={this.state.descdata.maplink} onChange={this.updateContent} fullWidth={true} name="maplink" />
        <TextField floatingLabelText="웹사이트" value={this.state.descdata.weblink} onChange={this.updateContent} fullWidth={true} name="weblink" />
      </div>
    )
    return (
      <div>
        <p>편집중인 설명문 번호: {this.props.targetid}</p>
        <hr />
          <p>{category[this.state.descdata.category]}</p>
          <p>{this.state.descdata.category < 2 ? <div>{this.state.descdata.title}</div> : null }</p>
          <p>최종 편집일자: {moment(this.state.descdata.dateedit).format('YYYY-MM-DD')}</p>

          {this.state.descdata.category >= 1 ? <ImageUpload postimage={this.updateImage} defaultimage={this.state.descdata.image} /> : null}
          {this.state.descdata.category >= 2 ? <div>{extrainfo}</div> : null}
          <div>편집 규칙: *제목(굵은글씨) -목록 >인용 @링크</div>
          <TextField floatingLabelText="내용" value={this.state.descdata.context} onChange={this.updateContent} multiLine={true} fullWidth={true} name="context"/>
        <hr />
        <RaisedButton label={this.props.createnew ? "등록" : "수정"} onClick={this.confirmModify} />
        {this.props.createnew ? null : <RaisedButton label="삭제" onClick={this.delete}/> }
        {this.state.goback ? <Redirect to="/admin/control" /> : null }
        <RaisedButton label="취소" onClick={this.sendBack}/>
      </div>
    )
  }
}

