/*global Vue*/
/*global axios*/


var app = new Vue({
  el: '#app',
  data: {
    addedTitle: '',
    addedSkill: '',
    addedAbout: '',
    ideas: {},
    showForm: false,
    showSupporters: false,
    user: null,
    email: '',
    username: '',
    password: '',
    skills: [],
    supporters: [],
    error: '',
    neededSkills: [],
    tempIdeaList: [],
    userIdeas: [],
    currentIdea: String,
    users: {},
    recommendedIdeas: [],
    filteredIdeas: {},
    supported: false,
    
  },
  created() {
    this.getUser();
    this.getIdeas();
    this.getFilteredIdeas();
      this.getSkills();
      this.getUsers();
      this.getUserIdeas();
      this.getRecommendedIdeas();
      // window.addEventListener('beforeunload', this.handler);
    
  },
  watch: {
  
  },
  
  methods: {
    
    async getFilteredIdeas() {
      console.log("GETTING FILTERED");
      await this.getIdeas();
      if(this.user != null){
        await this.getUser();
        let username = this.user.username;
        this.filteredIdeas = this.ideas.filter(function(idea) {
        return idea.author  != username;
      });   
      }
      else{
        this.filteredIdeas = this.ideas;
      }
      
    },
    async getRecommendedIdeas() {
      await this.getUser();
      try {
        let response = await axios.get("/api/ideas");
        let allIdeas = response.data;
        let userSkills = this.user.skills;
        // let response = await axios.get("/api/ideas/" + this.user.skills);
        for(let i = 0; i < allIdeas.length; i++){
          let idea = allIdeas[i];
          for(let k = 0; k < allIdeas[i].skills.length; k++){
            let skill = allIdeas[i].skills[k]
            for(let j = 0; j < userSkills.length; j++){
              let userSkill = userSkills[j];
              // console.log("Comparing needed skill (" + skill + ") to user skill(" + userSkill +")");
              if(skill == userSkill){
                // console.log("ITS A MATCH");
                this.recommendedIdeas.push(idea);
                break;
              }
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    async getSkills() {
      try {
        let response = await axios.get("/api/users");
        this.skills = response.data.skills;
      } catch (error) {
        console.log(error);
      }
    },
    async getUsers() {
      try {
        let response = await axios.get("/api/users/userList");
        this.users = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async getUserIdeas() {
      await this.getUser();
      try {
        let response = await axios.get("/api/ideas/userIdeas/" + this.user.username);
        this.userIdeas = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async getSupporters(idea) {
      console.log("GETTING SUPPORTERS");
      try {
        let response = await axios.get("/api/ideas/support/" + idea._id);
        this.supporters = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async getEmail(supporter) {
      try {
        let response = await axios.get("/api/users/" + supporter);
        return response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async getIdeas() {
      try {
        let response = await axios.get("/api/ideas");
        this.ideas = response.data;
        
      } catch (error) {
        console.log(error);
      }
    },
    async addIdea() {
      if (this.addedTitle == "" || this.addedAbout == "") {
          // alert("Name must be filled out");
          document.getElementById("empty-idea-error").innerHTML = "Title and description are required";
          return false;
      }
      document.getElementById("empty-idea-error").innerHTML = "";
      try {
        let response = await axios.post("/api/ideas", {
          username: this.user.username,
          title: this.addedTitle,
          about: this.addedAbout,
          skills: this.neededSkills,
        });
        this.tempIdeaList.push(response.data);
        this.addedTitle = "";
        this.addedAbout = "";
        this.neededSkills = [];
        // this.getUserIdeas();
        // this.neededSkills = [];
      } catch (error) {
        console.log(error);
      }
    },
    async addSkill() {
        if (this.addedSkill == "") {
          // alert("Name must be filled out");
          document.getElementById("empty-skill-error").innerHTML = "Please fill out before submitting";
          return false;
        }
        document.getElementById("empty-skill-error").innerHTML = "";
      try {
        let response = await axios.post("/api/users/skill", {
          skill: this.addedSkill,
          user: this.user,
        });
        this.addedSkill = '';
        this.getSkills();
      } catch (error) {
        console.log(error);
      }
      
    },
    async addNeededSkill() {
        if (this.addedSkill == "") {
          return false;
        }
        this.neededSkills.push(this.addedSkill);
        this.addedSkill = '';
      
    },
    async deleteNeededSkill(skill) {
      this.neededSkills.splice( this.neededSkills.indexOf(skill), 1 );
    },
    async deleteIdea(idea) {
      try {
        let response = await axios.delete("/api/ideas/" + idea._id);
        this.getIdeas();
      } catch (error) {
        this.toggleForm();
      }
    },
    async deleteSkill(skill) {
      try {
        let response = await axios.delete("/api/users/skill/" + this.user.username +"/"+ skill);
        this.getSkills();
      } catch (error) {
        console.log(error);
      }
    },
    async deleteUser(user) {
      try {
        let response = await axios.delete("/api/users/" + user._id);
        this.getUsers();
      } catch (error) {
        console.log(error);
      }
    },
    async removeSupporter(supporter) {
      try {
        let response = await axios.delete("/api/ideas/support/" + this.currentIdea +"/ "+ supporter);
        this.supporters = response.data;
        
      } catch (error) {
        console.log(error);
      }
    },
    async supportIdea(idea) {
      // await this.getSupporters(idea);
      try {
        let response = await axios.post("/api/ideas/support", {
          idea: idea,
          user: this.user,
        });
        this.getSupporters(idea);
        // this.getSkills();
      } catch (error) {
        console.log(error);
      }
    },
    async withdrawSupport(idea) {
      // await this.getSupporters(idea);
      try {
        let response = await axios.delete("/api/ideas/support/" + idea.title +"/ "+ this.user);
        this.supporters = response.data;
        this.getSupporters(idea);
      } catch (error) {
        console.log(error);
      }
    },
    checkIfSupported(idea, index){
      this.getSupporters(idea);
      console.log("CHECKING IF SUPPORTED ID: " + index);
      this.supported = false;
      for(let i = 0; i < this.supporters.length; i++){
        if(this.supporters[i].username == this.user.username){
          this.supported = true;
        }
      }
      if(this.supported){
        document.getElementById(index).innerHTML = "Support";
        document.getElementById(index).className = "support-btn";
        
        
      }
      else{
        document.getElementById(index).innerHTML = "Withdraw";
        document.getElementById(index).className = "withdraw-btn";
      }
    },
    checkBool(idea){
      for(let i = 0; i < idea.supporters.length; i++){
        if(idea.supporters[i].username == this.user.username){
          return true;
        }
      }
      return false;
    },
    toggleSupport(idea, index){
      this.checkIfSupported(idea, index);
      if(this.supported){
        console.log("Withdrawing Support");
        this.withdrawSupport(idea);
      }
      else{
        console.log("Supporting");
        this.supportIdea(idea);
      }
      // this.getSupporters(idea);
      this.supported = !this.supported;
    },
    toggleSupporters(idea) {
      this.getSupporters(idea);
      this.currentIdea = idea.title;
      this.showSupporters = !this.showSupporters;
    },
    toggleForm() {
      this.getSupporters();
      this.showForm = !this.showForm;
    },
    clearTemp(){
      this.tempIdeaList = [];
    },
    closeForm() {
      this.showForm = false;
    },
    closeSupporters(){
      this.showSupporters = false;
    },
    async register() {
      this.error = "";
      try {
        let response = await axios.post("/api/users", {
          username: this.username,
          password: this.password,
          email: this.email,
        });
        this.user = response.data;
        // close the dialog
        this.toggleForm();
        this.getIdeas();
      } catch (error) {
        this.error = error.response.data.message;
      }
    },
    async login() {
      this.error = "";
      try {
        let response = await axios.post("/api/users/login", {
          username: this.username,
          password: this.password,
          email: this.email,
        });
        this.user = response.data;
        // close the dialog
        this.toggleForm();
        this.getIdeas();
        this.getFilteredIdeas();
        this.getRecommendedIdeas();
      } catch (error) {
        this.error = error.response.data.message;
      }
    },
    async logout() {
      try {
        let response = await axios.delete("/api/users");
        this.user = null;
        this.userIdeas = [];
        window.location.href = "http://dev.davinparish.com:4210/index.html";
      } catch (error) {
        // don't worry about it
      }
    },
    async getUser() {
      try {
        let response = await axios.get("/api/users");
        this.user = response.data;
      } catch (error) {
        // Not logged in. That's OK!
      }
    },
    async editEmail() {
      try {
        // let response = await axios.post("/api/users/" + this.user + "/" + this.email);
        let response = await axios.post("/api/users/editEmail", {
          username: this.user.username,
          email: this.email,
        });
        // this.user = response.data;
      } catch (error) {
        // Not logged in. That's OK!
        
      }
    },
  }
});