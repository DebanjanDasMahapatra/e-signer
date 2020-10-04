import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button ,Form, Input, Alert,Spin} from 'antd';


import SignaturePad from 'react-signature-canvas'
import './App.css';
import 'antd/dist/antd.css';
import { Table } from 'antd';
import { Layout, Menu, Breadcrumb } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const baseUrl = '';

const { Header, Content, Footer } = Layout;
function Home() {
    const columns = [{
        title: 'Sl.no.',
        dataIndex: 'index',
        width:20,
        render: (text, record,index) => index+1,
      }, {
        title: 'Roll Number',
        dataIndex: 'roll',
        sorter: (a, b) => a.roll - b.roll,
      }, {
        title: 'Name',
        dataIndex: 'name',
        sorter: (a, b) => a.name> b.name,
      }, {
        title: 'Email',
        dataIndex: 'email',
      }, {
        title: 'Signature',
        dataIndex: 'signBuffer',
        render : (text, record,index)=>{
          // console.log(text,index);
            return <img className='sigImage'
            src={record.signBuffer} />
        }

      }];
      


      const [users,updateUsers] = useState([]);
      const [flag,setFlag] = useState(false);
      const [sigPad,setSigpad] = useState(null);
      const [spiner,updateSpinner] = useState(true);
      const [user,setUser] = useState({
        name: null,
        email: null,
        roll: null,
        signBuffer:null,
        errors: {
          name: ' ',
          email: ' ',
          roll: ' ',
          signBuffer:' '
        }
      });
        const [err,setErr] = useState(null);
      const showModal = () => {
        setFlag(true);
      };
      const hideModal = ()=>{
        setFlag(false);
      }

      useEffect(()=>{
        axios.get(baseUrl+'/work/getSigns')
        .then(res => {
          updateSpinner(false);
          if(res.data.status){
            updateUsers(res.data.data);
          }
          
          // const persons = res.data;
        })
      },[])

      const onChange= (pagination, filters, sorter)=>{
        // console.log('params', pagination, filters, sorter);
      }
    
        const clear = () => {
            sigPad.clear()
        }
        const downloadpdf = ()=>{
          window.open(baseUrl+'/work/download', '_blank');
          //window.location.href(baseUrl+'/work/download').target('_blank');
        }
        const handleChange = (event) => {
          setErr(null);
            const validEmailRegex = 
                    RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);
            event.preventDefault();
            const { name, value } = event.target;
            let errors = user.errors;
          
            switch (name) {
              case 'name': 
                errors.name = 
                  value.length < 1
                    ? 'Name required!'
                    : '';
                break;
              case 'email': 
                errors.email = 
                  validEmailRegex.test(value)
                    ? ''
                    : 'Email is not valid!';
                break;
              case 'roll': 
                errors.roll = 
                  (value+"").length < 11
                    ? 'Roll Number must be 11 Digit long!'
                    : '';
                break;
              default:
                break;
            }
            setUser({...user,[name]:value+"",errors})
            // setUser({errors, [name]: value}, ()=> {
            //     console.log(errors)
            // })
          }

          const handleSubmit = ()=>{
           updateSpinner(true);
            let imgData = sigPad.getTrimmedCanvas().toDataURL('image/png');
            if(user.name.length <1 ||user.email.length < 1||user.roll.length <1){
              alert("Please Fill the form!");
            }
            if(!imgData){
              alert("Signature Required!")
              return false;
            }else{
              //alert("form submit")
              setUser({...user,signBuffer:sigPad.getTrimmedCanvas().toDataURL('image/png')},()=> {
                // console.log(user);
              })
                let data = user;
                delete data['errors'];
                axios.post(baseUrl+'/work/sign',{...data,signBuffer:imgData}).then(res=>{
                  updateSpinner(false);
                  if(res.data.status){
                    window.location.reload(false);
                    // console.log("saved");
                  }else{
                    setErr(res.data.message);
                  }
                  
                 
                }).catch(error => {
                  updateSpinner(false);
                  setErr(error.response);
              });
               
             
            }
            
          }

  return (
    <Layout>
    <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
      <div className="logo" />
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
        <Menu.Item key="1" onClick={showModal}>Add Support</Menu.Item>
        <Menu.Item key="2"onClick={hideModal}>List</Menu.Item>
        {/* <Menu.Item key="3">Report Fake</Menu.Item> */}
      </Menu>
      <Button type="primary" shape="round" icon={<DownloadOutlined />} size='large' style={{position: 'absolute',right:0,minWidth: 'max-content'}} onClick={downloadpdf}> PDF </Button>
    </Header>
    {/* <Content className="site-layout" style={{ padding: '0 50px', marginTop: 64 }}> */}
        
        
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>No More Exam</Breadcrumb.Item>
      </Breadcrumb>
      <div className="site-layout-background" style={{ padding: 2, minHeight: 800 }}>
      {spiner?<div className="loader-holder" >
          <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>:null}
        {flag?
                        
            <div className='form-wrapper'>
              
                <h2>Sign to Support</h2>
                <form   noValidate >
                  {/* {errorString?
                  <small>{errorString}</small>:null
                  } */}
                  {err?
                        <span className='error'>{err}</span>:null}
                    <div className='fullName'>
                    <label htmlFor="fullName">Name</label>
                    <input type='text' name='name' onChange={handleChange} noValidate />
                    {user.errors.name.length > 1 && 
                        <span className='error'>{user.errors.name}</span>}
                    </div>
                    <div className='email'>
                    <label htmlFor="email">Email</label>
                    <input type='email' name='email' onChange={handleChange} noValidate />
                    {user.errors.email.length > 1 && 
                        <span className='error'>{user.errors.email}</span>}
                    </div>
                    <div className='roll'>
                    <label htmlFor="roll">Roll Number</label>
                    <input type='number' name='roll' onChange={handleChange} noValidate />
                    {user.errors.roll.length > 1 && 
                        <span className='error'>{user.errors.roll}</span>}
                    </div>
                    <div className='info'>
                    
                    
                    </div>
                    Sign
                    <div style={{height:'160px',width:'100%'}}>
                    <div className='sigContainer'>
                    <SignaturePad  canvasProps={{className: 'sigPad'}} ref={(ref) => { setSigpad(ref)}} />
                    </div>
                    </div>
                    {user.errors.signBuffer.length > 0 && 
                        <span className='error'>{user.errors.signBuffer}</span>}
                    <br></br>
                    <Button onClick={clear} style={{minWidth:'max-content'}}>clear</Button>
                    
                    
                </form>
                <div className='submit'>
                    <button disabled={user.errors.name.length > 0 ||user.errors.email.length > 0||user.errors.roll.length > 0 } onClick={handleSubmit}>Submit</button>
                    </div>
            </div>:
            <div>
                <Table
                 columns={columns} 
                 dataSource={users} 
                 onChange={onChange} 
                 scroll={{ x: 400 }} 
                 size='small'
                 title= {()=> 'No Exam Petition'} 
                 pagination={{
                  total: users.length,
                  pageSize: users.length,
                  hideOnSinglePage: true
              }}/>
              {/* <Button type="primary" shape="round" icon={<DownloadOutlined />} size='large' style={{position: 'absolute',right:0,top: 0,minWidth: 'max-content'}}> PDF </Button> */}
            </div>
        }
      </div>
    {/* </Content> */}
    <Footer style={{ textAlign: 'center' }}>Digi-Sign ©2030 Created by Future Team</Footer>
  </Layout>
  );
}

export default Home;
