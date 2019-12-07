/*global Vue*/
/*global axios*/


var app = new Vue({
  el: '#app',
  data: {
    addedName: '',
    addedSkill: '',
    addedAbout: '',
    ideas: {},
    showForm: false,
    user: null,
    email: '',
    username: '',
    password: '',
    skills: [],
    error: '',
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
    async getIdeas() {
      try {
        let response = await axios.get("/api/ideas");
        this.ideas = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async addIdea() {
      try {
        let response = await axios.post("/api/ideas", {
          name: this.addedName,
          problem: this.addedProblem
        });
        this.addedName = "";
        this.addedProblem = "";
        this.getIdeas();
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
    toggleForm() {
      this.error = "";
      this.username = "";
      this.password = "";
      this.showForm = !this.showForm;
    },
    closeForm() {
      this.showForm = false;
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