<template>
<div class="foxgis-data-cards">
  <mdl-snackbar display-on="mailSent"></mdl-snackbar>
  <div class="card" v-for='u in pageConfig.page_item_num' v-if="((pageConfig.current_page-1)*pageConfig.page_item_num+$index) < dataset.length" track-by="$index" >
    <div class="name" @click="showDetails($event,dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].sprite_id)">
      <input type="text" maxlength="50" class="sprite-name" :value="dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].name" @change="uploadNameChange($event, (pageConfig.current_page-1)*pageConfig.page_item_num+$index)"/>
      <mdl-anchor-button accent raised v-mdl-ripple-effect @click="downloadSprite((pageConfig.current_page-1)*pageConfig.page_item_num+$index)">下载</mdl-anchor-button>
    </div>
    <div class="meta">
      <p>
      上传时间：<span>{{ dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].createdAt }}</span>
      共享范围：<select id="icon-scope" v-model="dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].scope" @change="editScope($event, (pageConfig.current_page-1)*pageConfig.page_item_num+$index)">
          <option value="private">私有</option>
          <option value="public">公开</option>
        </select>
      </p>
      <mdl-anchor-button colored v-mdl-ripple-effect class = "delete-button" @click="deleteSprite(dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].sprite_id)">删除</mdl-anchor-button>
    </div>
    <div class="details">
      <foxgis-icon-panel :dataset="sprite" class="icon-panel"></foxgis-icon-panel>
    </div>
  </div>
  <div id="pagination" v-show="dataset.length>0?true:false">
    <ul>
      <li id="page-pre" disabled v-on:click="prePage" v-bind:class="pageConfig.current_page > 1?'':'disabled'">
        <span><i class="material-icons">navigate_before</i></span>
      </li>
      <li class="waves-effect" v-for="page in show_page_num"  v-bind:class="{ 'page-active': pageConfig.current_page == page + pageConfig.first_page}" v-on:click="setPage(page)"><span>{{ pageConfig.first_page + page }}</span></li>
      <li id="page-next" v-on:click="nextPage" v-bind:class="(total_items/pageConfig.page_item_num > 1)&&(pageConfig.current_page < parseInt(total_items/pageConfig.page_item_num)+1)?'':'disabled'">
        <span><i class="material-icons">navigate_next</i></span>
      </li>
    </ul>
  </div>

  <div class="modal preview-modal" @click="hidePreview">
    <div class="image-container" >
       <img id='thumbnail'>
    </div>
  </div>

  <foxgis-dialog id="delete-dialog" class='modal' :dialog="dialogcontent" @dialog-action="deleteAction"></foxgis-dialog>
</div>
</template>


<script>
import Cookies from 'js-cookie'
export default {
  props: ['dataset'],
  methods: {
    showDetails: function (e,sprite_id) {
      //移除之前的active
      let activeCards = this.$el.querySelector('.active');
      if(activeCards&&activeCards!==e.target.parentElement){
        activeCards.className = activeCards.className.replace(' active','');
      }
      //给当前的dom添加active
      let claName = e.target.parentElement.className;
      if(claName.indexOf('active')!=-1){
        claName = claName.replace(' active','');
      }else{
        claName += ' active';
        if(this.sprite.sprite_id!==sprite_id){
          this.sprite.sprite_id = '';
          this.sprite.pngUrl = '';
          this.sprite.icons = [];
          for(let s=0;s<this.dataset.length;s++){
            if(this.dataset[s].sprite_id === sprite_id){
              this.sprite.description = this.dataset[s].description;
            }
          }
          
          let username = Cookies.get('username');
          let access_token = Cookies.get('access_token');
          let pngUrl = SERVER_API.sprites + '/' + username+'/'+sprite_id+'/sprite.png?access_token='+access_token;
          this.sprite.sprite_id = sprite_id;
          this.sprite.pngUrl = pngUrl;
          let jsonUrl = SERVER_API.sprites + '/' + username+'/'+sprite_id+'/sprite.json';
          this.$http({ url: jsonUrl, method: 'GET', headers: { 'x-access-token': access_token} })
          .then(function(response){
            //请求成功
            let data = response.data;
            let names = Object.keys(data);
            this.sprite.icons = [];//初始化
            for(let i=0;i<names.length;i++){
              this.sprite.icons.push({'name':names[i],'positions':data[names[i]]});
            }
          },function(){
            //请求失败
            this.$broadcast('mailSent', { message: '符号列表获取失败！',timeout:3000 });
          });
        } 
      }
      e.target.parentElement.className = claName;
    },

    editScope: function(e,index){//修改共享范围
        let scope = e.target.value;
        let username = Cookies.get('username');
        let access_token = Cookies.get('access_token');
        let sprite_id = this.dataset[index].sprite_id;
        let url = SERVER_API.sprites + '/' + username + '/'+ sprite_id;
        this.$http({url:url,method:'PATCH',data:{'scope':scope},headers: { 'x-access-token': access_token }}).then(function(response){
  
          },function(response){
            alert("编辑错误");
          });
    },

    uploadNameChange: function(e,index){//修改符号名称
      let value = e.target.value;
      let sprite_id = this.dataset[index].sprite_id;
      let username = Cookies.get('username');
      let access_token = Cookies.get('access_token');
      let url = SERVER_API.sprites + '/' + username + '/'+ sprite_id;
      this.dataset[index].name = value;
      this.$http({url:url,method:'PATCH',data:{'name':value},headers:{'x-access-token':access_token}})
        .then(function(response){
          let data = response.data;
          let input = $(".sprite-name");
          for(let i=0;i<input.length;i++){
            input[i].blur();
            input[i].value = this.dataset[i].name;
          }
        }, function(response) {
          alert("网络错误");
      });
    },

    showPreview: function(e, index) {
      let username = Cookies.get('username');
      let access_token = Cookies.get('access_token');
      let url = SERVER_API.sprites + '/' + username+'/'+this.dataset[index].sprite_id+'/sprite.png?access_token='+access_token;
      
        let image2 = new Image();
          image2.onload = function () {
              let canvas = document.createElement('canvas');
              canvas.width = this.width; // or 'width' if you want a special/scaled size
              canvas.height = this.height; // or 'height' if you want a special/scaled size
              canvas.getContext('2d').drawImage(this, 0, 0);
              // Get raw image data
              let raw="data:image/png;base64,"+canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
              document.querySelector('#thumbnail').src = raw;
              document.querySelector('.preview-modal').style.display = 'block';
          };
          image2.crossOrigin = "Anonymous";
          image2.src = url;
      
    },

    downloadSprite: function(index) {
      let username = Cookies.get('username');
      let access_token = Cookies.get('access_token');
      let url = SERVER_API.sprites + '/' + username + '/' + this.dataset[index].sprite_id + '/raw?access_token='+ access_token;
      if((/Trident\/7\./).test(navigator.userAgent)||(/Trident\/6\./).test(navigator.userAgent)){
      //IE10/IE11
        var aLink = document.createElement('a')
        aLink.className = 'download_link'
        var text = document.createTextNode('&nbsp;')
        aLink.appendChild(text)
        aLink.href = url
        aLink.click()
      }else{//Chrome,Firefox
        var iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style = "display:none";
        document.body.appendChild(iframe);
      }
    },

    hidePreview: function(e) {
      if (e.target.className.indexOf('preview-modal') != -1) {
        e.target.style.display = 'none';
      }
    },

    deleteSprite: function(sprite_id) {//删除符号
      this.dialogcontent.title = "确定删除吗？";
      this.$el.querySelector('#delete-dialog').style.display = 'block';
      this.deleteUploadId = sprite_id;
    },

    deleteAction: function(status) {
      if (status === 'ok') {
        var username = Cookies.get('username');
        var access_token = Cookies.get('access_token');
        let sprite_id = this.deleteUploadId;
        let url = SERVER_API.sprites + '/' + username + "/" + sprite_id;
        this.$http({url:url,method:'DELETE',headers:{'x-access-token':access_token}})
        .then(function(response){
          if(response.ok){
            this.$dispatch("delete_sprite", sprite_id);
          }
        }, function(response) {
            alert('未知错误，请稍后再试');
        });
        this.deleteUploadId = "";//重置deleteUploadId
      }
    },

    nextPage: function (event) {      
      let allPages = Math.ceil(this.total_items / this.pageConfig.page_item_num)
      if(this.pageConfig.current_page === allPages){
        return
      }
      this.pageConfig.current_page += 1;
      let activeCards = this.$el.querySelector('.active');
      if(activeCards){
        activeCards.className = activeCards.className.replace(' active','');
      }//去掉active card
      if(this.pageConfig.current_page > this.show_page_num){
        this.pageConfig.first_page +=1;
      }
    },

    prePage: function (event) {     
      if(this.pageConfig.current_page === 1){
        return
      }
      this.pageConfig.current_page -= 1;
      let activeCards = this.$el.querySelector('.active');
      if(activeCards){
        activeCards.className = activeCards.className.replace(' active','');
      }//去掉active card
      if(this.pageConfig.current_page < this.pageConfig.first_page){
        this.pageConfig.first_page -=1;
      }
    },

    setPage: function (page) {
      let activeCards = this.$el.querySelector('.active');
      if(activeCards){
        activeCards.className = activeCards.className.replace(' active','');
      }//去掉active card
      this.pageConfig.current_page = page+1;
    }
  },
  computed: {
     show_page_num: function (){
        let cop_page_num = Math.ceil(this.total_items / this.pageConfig.page_item_num);
        if(this.pageConfig.current_page > cop_page_num&&cop_page_num>0){
          this.pageConfig.current_page = cop_page_num;
        }
        return cop_page_num > 5 ? 5 : cop_page_num;
     },

     total_items: function (){
      let allCount = this.$parent.dataset.length;
      let count = this.dataset.length;
      this.$dispatch("sprite_nums", allCount);
      return count;
     }
   },
  data(){
    return {
      pageConfig: {
        page_item_num: 10,         //每页显示的条数
        current_page: 1,
        first_page: 1,
      },
      dialogcontent: {
        title: '确定删除吗？',
        textOk:'删除',
        textCancel:'取消'
      },
      deleteSpriteId: "",//
      sprite:{//每一个卡片一张雪碧图
        sprite_id:'',//该雪碧图的id
        pngUrl:'',//该雪碧图的url
        icons:[],//该雪碧图包含的所有icon，每个icon包括name和positions两个属性
        description:''//该雪碧图的说明文字
      }
    }
  }
}

</script>


<style scoped>
.card {
/*  height: 120px;*/
  border-radius: 2px 2px 0 0;
  transform: translatez(0);
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.12);
  outline: none;
  overflow: hidden;
  transition: .2s;
}

.card+.card {
  margin-top: 1px;
}

.card:focus, .card:hover {
  box-shadow: 0 4px 4px rgba(0,0,0,.12);
  margin: 12px -12px;
}

.card .name {
  margin: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  cursor: pointer;
}

.card .meta {
  margin: 5px 24px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.active .meta {
  display: none;
}

.active .name {
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  /* padding: 12px 12px 15px; */
}

.active .name input {
  font-size: 24px;
  transition:0.2s;
} 
.details{
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  padding: 0;
  transition: .3s;
}

.details .icon-panel{
  margin-left: 45px;
  margin-right: 45px;
  margin-bottom: 45px;
}
.active .details{
  max-height: 1000px;
  opacity: 1;
  transition:0.5s;
}

.foxgis-data-cards .card.active {
  box-shadow: 0 4px 4px rgba(0,0,0,.12);
  margin: 24px -24px;
}
/* .active{
  box-shadow: 0 4px 4px rgba(0,0,0,.12);
  margin: 24px -24px;
} */
.meta p {
  color: #9E9E9E;
  font-size: 12px;
  margin: 0;
}

.meta .mdl-button {
  text-align: right;
  min-width: 0;
}

.meta span{
    border: 0;
    width: 200px;
    color: #9E9E9E;
    font-size: 12px;
    margin: 0;
    display: inline-block;
}

.name {
  margin: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
}

.name input {
  font-size: 16px;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  width: 360px;
  transition: 0.2s;
}

#pagination {
  text-align: center;
  display: block;
}

#pagination li.disabled {
  color: #9c9696;
}

#pagination .material-icons {
  vertical-align: middle;
}

#pagination ul {
  padding: 10px;
  display: inline-block;
}

#pagination li {
  display: inline-block;
  margin: 0 10px;
  list-style-type: disc;
  cursor: pointer;
  width: 30px;
}

#pagination li:not(.page-active):hover {
  background-color: #eaa5bd;
  font-weight: bold;
}

#pagination li.page-active {
  background-color: #ff4081;
  font-weight: bolder;
}

#pagination li span {
  padding: 6px;
  line-height: 30px;
  font-size: 18px;
}

#page-pre {
  margin-right: 10px;
}

#page-next {
  margin-left: 10px;
  vertical-align: middle;
}

.modal {
  position: fixed;
  left: 240px;
  right: 0px;
  top:0px;
  bottom: 0px;
  margin: 0 auto;
  padding-bottom: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  display: none;
  z-index: 9999;
  overflow: auto;
}

.image-container {
  max-width: 800px;
  margin: 200px auto 0 auto;
}

.image-container img {
  clear: both;
  display: block;
  margin: 0 auto;
  max-width: 800px;
  max-height: 541px;
}

.delete-button{
  position: relative;
  left: -18px;
}

.add-button{
  position: relative;
  left: -29px;
  float: right;    
  height: 20px;  
  line-height: 20px;
}

.details .icon-link:hover{
  background-color: #ababab;
  cursor:pointer;
  /* margin-left: auto;
  margin-right: auto; */
} 
.details .meta-title{
  margin-top: 12px;
  margin-bottom: 12px;
  margin-left: 5px;
}
.details .panel{
  display: flex;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  background-color: #D8D8D8;
  overflow: auto;
  margin: 5px;
  height: calc(100% - 50px);
}

.details .panel::-webkit-scrollbar {
  width: 6px;
}

/* 滚动条的滑轨背景颜色 */
.details .panel::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}

/* 滑块颜色 */
.details .panel::-webkit-scrollbar-thumb {
    background-color: #adadad;
}

.details .description input{
  font-size: 16px;
  margin: 5px 0;
  border: none;
  padding: 5px 5px 5px 0;
  width: 60%;
}
</style>
