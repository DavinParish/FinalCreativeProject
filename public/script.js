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
    
  },
  created() {
    this.getUser();
    this.getIdeas();
    this.getSkills();
    this.getUsers();
    this.getUserIdeas();
    
    
  },
  methods: {
    async getSkills() {
      try {
        let response = await axios.get("/api/users");
        console.log("Skills list");
        console.log(response.data.skills);
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
      console.log("Get user ideas: ");
      console.log(this.user.username);
      try {
        let response = await axios.get("/api/ideas/userIdeas/" + this.user.username);
        this.userIdeas = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async getSupporters(idea) {
      console.log("idea title");
      console.log(idea.title);
      try {
        let response = await axios.get("/api/ideas/support/" + idea._id);
        console.log("Supporters list");
        console.log(response.data);
        console.log(response);
        this.supporters = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async getEmail(supporter) {
      console.log("GETTING THE EMAIL");
      try {
        let response = await axios.get("/api/users/" + supporter);
        console.log("EMAIL: " + response.data);
        // this.email = response.data;
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
      console.log("SUBMITTING IDEA");
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
      console.log(this.user);
      console.log(this.addedSkill);
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
        this.neededSkills.push(this.addedSkill);
        this.addedSkill = '';
      
    },
    async deleteNeededSkill(skill) {
      console.log("INDEX");
      console.log(this.neededSkills.indexOf(skill));
      console.log(this.neededSkills)
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
      console.log("user");
      console.log(this.user);
      console.log(skill);
      try {
        let response = await axios.delete("/api/users/skill/" + this.user.username +"/ "+ skill);
        this.getSkills();
      } catch (error) {
        console.log(error);
      }
    },
    async deleteUser(user) {
      console.log("user");
      console.log(user._id);
      try {
        let response = await axios.delete("/api/users/" + user._id);
        this.getUsers();
      } catch (error) {
        console.log(error);
      }
    },
    async removeSupporter(supporter) {
      console.log("supporter");
      console.log(supporter);
      try {
        let response = await axios.delete("/api/ideas/support/" + this.currentIdea +"/ "+ supporter);
        this.supporters = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async supportIdea(idea) {
      console.log("script: ADDING SUPPORTER");
      try {
        let response = await axios.post("/api/ideas/support", {
          idea: idea,
          user: this.user,
        });
        // this.getSkills();
      } catch (error) {
        console.log(error);
      }
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
      } catch (error) {
        this.error = error.response.data.message;
      }
    },
    async logout() {
      try {
        let response = await axios.delete("/api/users");
        this.user = null;
        this.userIdeas = [];
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
      console.log("EDIT EMAIL");
      console.log(this.user);
      console.log(this.user.email);
      
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