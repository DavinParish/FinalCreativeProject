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
    
  },
  created() {
    this.getUser();
    this.getIdeas();
    this.getSkills();
    
    
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
    async getUserIdeas() {
      try {
        let response = await axios.post("/api/ideas/userIdeas", {
          author: this.user.username,
        });
        this.ideas = response.data.userIdeas;
      } catch (error) {
        console.log(error);
      }
    },
    async getSupporters(idea) {
      try {
        let response = await axios.post("/api/ideas/support", {
          idea: idea,
        });
        console.log("Supporters list");
        console.log(response.data.supporters);
        this.supporters = response.data.supporters;
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
    async supportIdea(idea) {
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
    
    toggleForm(idea) {
      this.getSupporters(idea)
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
          password: this.password
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
          password: this.password
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
  }
});