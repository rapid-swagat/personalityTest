import React, { Component } from "react";
import "./Form.css";
import axios from "axios";
import { ToastsContainer, ToastsStore } from "react-toasts";
import { Redirect } from "react-router-dom";
import { Spinner, SpinnerSize, Overlay } from "office-ui-fabric-react";

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
      answers: [],
      pause: false,
      pause2: false,
      user_id: 0,
      personality_id: 0,
      personality_existence: false,
    };
  }

  checkTraitIndex = (filtered, traitStep, traitNum) => {
    let dataCheck = filtered.filter((data) => {
      return data.QuesIndex == traitStep && data.trait_number == traitNum;
    });
    return dataCheck;
  };

  async componentDidMount() {
    this.setState({ pause: true });
    let name = this.props.location.state.token;
    let userData = await axios({
      method: "GET",
      url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Principals/All/items`,
      headers: {
        Authorization: "Bearer " + this.props.location.state.name,
      },
    });

    let idUser = userData.data.value.filter((data) => {
      return data.display_name == name;
    });
    let userID = idUser[0].id;

    let personalityProfData = await axios({
      method: "GET",
      url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Personality%20Profiles/All/items`,
      headers: {
        Authorization: "Bearer " + this.props.location.state.name,
      },
    });

    let profDataExistence = personalityProfData.data.value.filter((data) => {
      return data.user_id == userID;
    });

    if (profDataExistence.length) {
      let checkFlag = 1;
      let profUser = await axios({
        method: "GET",
        url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/ProfileUsers/All/items`,
        headers: {
          Authorization: "Bearer " + this.props.location.state.name,
        },
      });
      let prof = profUser.data.value;
      let existingUser = prof.filter(function (el) {
        return el.name == name;
      });

      let questionNumber = 1,
        personalityID = 9;

      let profileData = await axios({
        method: "GET",
        url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists//Personality%20Profiles/All/items`,
        headers: {
          Authorization: "Bearer " + this.props.location.state.name,
        },
      });

      let profExisiting = profileData.data.value.filter(function (el) {
        return el.user_id == userID;
      });

      let dataRes = await axios({
        method: "GET",
        url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists//Personality%20Profiles/items/${profExisiting[0].id}`,
        headers: {
          Authorization: "Bearer " + this.props.location.state.name,
        },
      });
      let createdDate = dataRes.data.created;
      personalityID = dataRes.data.id;
      //  date = new Date(2020, 0, 5);
      let date = new Date();
      let diffTime = new Date(createdDate).getTime() - date.getTime();
      let diffDays = Math.abs(diffTime / 86400000);
      if (diffDays / 365 >= 1) questionNumber = 7;

      if (existingUser.length) {
        questionNumber = 1;
        let arrDate = [];
        for (let i = 0; i < existingUser.length; i++) {
          arrDate.push(existingUser[i].answer_date);
        }
        arrDate.sort();
        let da = arrDate[arrDate.length - 1];
        let date = new Date();
        let diffTime = new Date(da).getTime() - date.getTime();
        let diffDays = Math.abs(diffTime / 86400000);

        if (diffDays <= 7) {
          this.setState({ questions: "no", pause: false });
          checkFlag = 0;
        }
      } else {
        questionNumber = 7;
      }

      if (checkFlag) {
        let link = "lists/Questions/All/items";
        let flag = 0;
        let traitStep1,
          traitStep2,
          traitStep3,
          traitStep4,
          traitStep5,
          traitStep6,
          traitStep7,
          res;
        let questionData = [];
        do {
          res = await axios.get(
            `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/${link}`,
            {
              headers: {
                Authorization: "Bearer " + this.props.location.state.name,
              },
            }
          );

          questionData = questionData.concat(res.data.value);
          if (res.data["@odata.nextLink"] !== undefined)
            link = res.data["@odata.nextLink"];
          else flag = 1;
        } while (flag === 0);

        let group1 = questionData.reduce((r, a) => {
          r[a.trait_id] = [...(r[a.trait_id] || []), a];
          return r;
        }, {});

        link = "lists/Traits/All/items";
        let allTraitData = [];
        flag = 0;
        do {
          res = await axios.get(
            `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/${link}`,
            {
              headers: {
                Authorization: "Bearer " + this.props.location.state.name,
              },
            }
          );
          allTraitData = allTraitData.concat(res.data.value);
          if (res.data["@odata.nextLink"] !== undefined)
            link = res.data["@odata.nextLink"];
          else flag = 1;
        } while (flag === 0);

        let data = allTraitData;

        let filtered = data.filter(function (el) {
          return el.user_name == name;
        });

        let dataCheck;
        //trait1
        traitStep1 = parseInt(Math.random() * (group1[1].length - 8) + 0);

        let existingTrait1 = filtered.filter(function (el) {
          return el.trait_number == 1;
        });

        if (existingTrait1.length > group1[1].length - 9) {
          for (let q = 0; q < existingTrait1.length; q++) {
            let itemID = existingTrait1[q]["id"];
            await axios({
              method: "DELETE",
              url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Traits/items/${itemID}`,
              headers: {
                Authorization: "Bearer " + this.props.location.state.name,
              },
            });
          }
        } else {
          while (1) {
            traitStep1 = parseInt(Math.random() * (group1[1].length - 8) + 0);
            dataCheck = this.checkTraitIndex(filtered, traitStep1, 1);
            if (!dataCheck.length) break;
          }
        }

        //trait2
        traitStep2 = parseInt(Math.random() * (group1[2].length - 8) + 0);
        let existingTrait2 = filtered.filter(function (el) {
          return el.trait_number == 2;
        });

        if (traitStep2.length > group1[2].length - 9) {
          for (let q = 0; q < existingTrait2.length; q++) {
            let itemID = existingTrait2[q]["id"];
            await axios({
              method: "DELETE",
              url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Traits/items/${itemID}`,
              headers: {
                Authorization: "Bearer " + this.props.location.state.name,
              },
            });
          }
        } else {
          while (1) {
            traitStep2 = parseInt(Math.random() * (group1[2].length - 8) + 0);
            dataCheck = this.checkTraitIndex(filtered, traitStep2, 2);
            if (!dataCheck.length) break;
          }
        }

        //trait3
        traitStep3 = parseInt(Math.random() * (group1[3].length - 8) + 0);
        let existingTrait3 = filtered.filter(function (el) {
          return el.trait_number == 3;
        });

        if (traitStep3.length > group1[3].length - 9) {
          for (let q = 0; q < existingTrait3.length; q++) {
            let itemID = existingTrait3[q]["id"];
            await axios({
              method: "DELETE",
              url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Traits/items/${itemID}`,
              headers: {
                Authorization: "Bearer " + this.props.location.state.name,
              },
            });
          }
        } else {
          while (1) {
            traitStep3 = parseInt(Math.random() * (group1[3].length - 8) + 0);
            dataCheck = this.checkTraitIndex(filtered, traitStep3, 3);
            if (!dataCheck.length) break;
          }
        }

        //trait4
        traitStep4 = parseInt(Math.random() * (group1[4].length - 8) + 0);
        let existingTrait4 = filtered.filter(function (el) {
          return el.trait_number == 4;
        });

        if (traitStep4.length > group1[4].length - 9) {
          for (let q = 0; q < existingTrait4.length; q++) {
            let itemID = existingTrait4[q]["id"];
            await axios({
              method: "DELETE",
              url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Traits/items/${itemID}`,
              headers: {
                Authorization: "Bearer " + this.props.location.state.name,
              },
            });
          }
        } else {
          while (1) {
            traitStep4 = parseInt(Math.random() * (group1[4].length - 8) + 0);
            dataCheck = this.checkTraitIndex(filtered, traitStep4, 4);
            if (!dataCheck.length) break;
          }
        }

        //trait5
        traitStep5 = parseInt(Math.random() * (group1[5].length - 8) + 0);
        let existingTrait5 = filtered.filter(function (el) {
          return el.trait_number == 5;
        });

        if (traitStep5.length > group1[5].length - 9) {
          for (let q = 0; q < existingTrait5.length; q++) {
            let itemID = existingTrait5[q]["id"];
            await axios({
              method: "DELETE",
              url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Traits/items/${itemID}`,
              headers: {
                Authorization: "Bearer " + this.props.location.state.name,
              },
            });
          }
        } else {
          while (1) {
            traitStep5 = parseInt(Math.random() * (group1[5].length - 8) + 0);
            dataCheck = this.checkTraitIndex(filtered, traitStep5, 5);
            if (!dataCheck.length) break;
          }
        }

        //trait6
        traitStep6 = parseInt(Math.random() * (group1[6].length - 8) + 0);

        let existingTrait6 = filtered.filter(function (el) {
          return el.trait_number == 6;
        });

        if (traitStep6.length > group1[6].length - 9) {
          for (let q = 0; q < existingTrait6.length; q++) {
            let itemID = existingTrait6[q]["id"];
            await axios({
              method: "DELETE",
              url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Traits/items/${itemID}`,
              headers: {
                Authorization: "Bearer " + this.props.location.state.name,
              },
            });
          }
        } else {
          while (1) {
            traitStep6 = parseInt(Math.random() * (group1[6].length - 8) + 0);
            dataCheck = this.checkTraitIndex(filtered, traitStep6, 6);
            if (!dataCheck.length) break;
          }
        }

        //trit7
        traitStep7 = parseInt(Math.random() * (group1[7].length - 8) + 0);
        let existingTrait7 = filtered.filter(function (el) {
          return el.trait_number == 7;
        });

        if (traitStep7.length > group1[7].length - 9) {
          for (let q = 0; q < existingTrait7.length; q++) {
            let itemID = existingTrait7[q]["id"];
            await axios({
              method: "DELETE",
              url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Traits/items/${itemID}`,
              headers: {
                Authorization: "Bearer " + this.props.location.state.name,
              },
            });
          }
        } else {
          while (1) {
            traitStep7 = parseInt(Math.random() * (group1[7].length - 8) + 0);
            dataCheck = this.checkTraitIndex(filtered, traitStep7, 7);
            if (!dataCheck.length) break;
          }
        }

        let questionAsked = [];
        let questions = [];
        for (let i = 0; i < questionNumber; i++) {
          questions.push(group1[1][traitStep1]);
          questions.push(group1[2][traitStep2]);
          questions.push(group1[3][traitStep3]);
          questions.push(group1[4][traitStep4]);
          questions.push(group1[5][traitStep5]);
          questions.push(group1[6][traitStep6]);
          questions.push(group1[7][traitStep7]);
          traitStep1 = traitStep1 + 3;
          if (traitStep1 > group1[1].length - 1) traitStep1 = 0;
          traitStep2 = traitStep2 + 3;
          if (traitStep2 > group1[2].length - 1) traitStep2 = 0;
          traitStep3 = traitStep3 + 3;
          if (traitStep3 > group1[3].length - 1) traitStep3 = 0;
          traitStep4 = traitStep4 + 3;
          if (traitStep4 > group1[4].length - 1) traitStep4 = 0;
          traitStep5 = traitStep5 + 3;
          if (traitStep5 > group1[5].length - 1) traitStep5 = 0;
          traitStep6 = traitStep6 + 3;
          if (traitStep6 > group1[6].length - 1) traitStep6 = 0;
          traitStep7 = traitStep7 + 3;
          if (traitStep7 > group1[7].length - 1) traitStep7 = 0;
          questionAsked.push({ trait_number: 1, ques_index: traitStep1 });
          questionAsked.push({ trait_number: 2, ques_index: traitStep2 });
          questionAsked.push({ trait_number: 3, ques_index: traitStep3 });
          questionAsked.push({ trait_number: 4, ques_index: traitStep4 });
          questionAsked.push({ trait_number: 5, ques_index: traitStep5 });
          questionAsked.push({ trait_number: 6, ques_index: traitStep6 });
          questionAsked.push({ trait_number: 7, ques_index: traitStep7 });
        }

        for (let i = 0; i < questionAsked.length; i++) {
          let item = {
            trait_number: questionAsked[i]["trait_number"],
            ques_index: questionAsked[i]["ques_index"],
            user_name: name,
            user_id: userID,
            LinkedItemsToAdd: [`Personality Profiles/${personalityID}`],
          };

          axios({
            method: "POST",
            url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Traits/All/items`,
            data: JSON.stringify(item),
            headers: {
              Authorization: "Bearer " + this.props.location.state.name,
              "Content-Type": "application/json",
            },
          });
        }

        this.setState({
          pause: false,
          questions: questions,
          user_id: userID,
          personality_id: personalityID,
        });
      }
    } else {
      this.setState({
        personality_existence: true,
      });
    }
  }

  handleClick = (e) => {
    let resData = {
      question: e.target.name,
      answer: e.target.value,
      user: this.props.location.state.token,
    };

    let data = this.state.answers;

    let dataCheck = data.filter((res) => {
      if (res.question == resData.question) return res.question;
    });

    if (dataCheck.length) {
      let removeindex = data.findIndex((x) => x.question === resData.question);
      data.splice(removeindex, 1);
    }

    data.push(resData);
    this.setState({ answers: data });
  };

  renderTableData() {
    return this.state.questions.map((questionAll, index) => {
      const { question, trait } = questionAll;
      return (
        <tr style={{ borderBottom: "1px solid #ccc" }}>
          <th className="first-col">{question}</th>

          <td>
            <input
              type="radio"
              onChange={this.handleClick}
              className="radio4"
              name={`${question} traitData${trait}`}
              value="stronglyagree"
            />
            <br />
            <br />
            <p className="table-data">Strongly agree</p>
          </td>
          <td>
            <input
              type="radio"
              onChange={this.handleClick}
              className="radio3"
              name={`${question} traitData${trait}`}
              value="agree"
            />
            <br />
            <br />
            <p className="table-data">Agree</p>
          </td>
          <td>
            <input
              type="radio"
              onChange={this.handleClick}
              className="radio2"
              name={`${question} traitData${trait}`}
              value="neutral"
            />
            <br />
            <br />
            <p className="table-data">Neutral</p>
          </td>
          <td>
            <input
              type="radio"
              onChange={this.handleClick}
              className="radio3"
              name={`${question} traitData${trait}`}
              value="disagree"
            />
            <br />
            <br />

            <p className="table-data">Disagree</p>
          </td>
          <td>
            <input
              type="radio"
              onChange={this.handleClick}
              className="radio4"
              name={`${question} traitData${trait}`}
              value="stronglydisagree"
            />
            <br />
            <br />
            <p className="table-data">Strongly Disagree</p>
          </td>
        </tr>
      );
    });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    if (this.state.answers.length == this.state.questions.length) {
      this.setState({ pause2: true });
      let answers = this.state.answers;
      let questions = this.state.questions;
      let dataResponse = [];
      let score, trait, result, groupTrait;
      for (let i = 0; i < answers.length; i++) {
        trait = answers[i].question.split("traitData")[1];

        answers[i].question = answers[i].question.replace(
          / *\b\S*?trait\S*\b/g,
          ""
        );

        result = questions.filter((obj) => {
          return obj.question == answers[i].question && obj.trait == trait;
        });

        switch (answers[i].answer) {
          case "stronglydisagree":
            score = ((1 - 3) / 2) * result[0].weight;
            break;
          case "disagree":
            score = ((2 - 3) / 2) * result[0].weight;
            break;
          case "neutral":
            score = 0;
            break;
          case "agree":
            score = ((4 - 3) / 2) * result[0].weight;
            break;
          case "stronglyagree":
            score = ((5 - 3) / 2) * result[0].weight;
            break;

          default:
            break;
        }
        if (result[0].trait == "Honesty-Humility")
          result[0].trait = "HonestyHumility";

        dataResponse.push({
          question: result[0].question,
          answer: answers[i].answer,
          question_id: result[0].question_id,
          question_direction: result[0].ques_direction,
          facet_id: result[0].facet_id,
          facet_direction: result[0].facet_dir,
          trait_id: result[0].trait_id,
          trait: result[0].trait,
          weight: result[0].weight,
          facet: result[0].facet,
          respondant: this.props.location.state.token,
          score: score,
          user_id: this.state.user_id,
          LinkedItemsToAdd: [
            `Personality Profiles/${this.state.personality_id}`,
          ],
        });
      }

      for (let i = 0; i < dataResponse.length; i++) {
        await axios({
          method: "POST",
          url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/Answers/All/items`,
          data: JSON.stringify(dataResponse[i]),
          headers: {
            Authorization: "Bearer " + this.props.location.state.name,
            "Content-Type": "application/json",
          },
        });
      }

      groupTrait = dataResponse.reduce(function (r, a) {
        r[a.trait] = r[a.trait] || [];
        r[a.trait].push(a);
        return r;
      }, Object.create(null));

      let scoreAgreeableness = 0,
        scoreConscientiousness = 0,
        scoreEmotionality = 0,
        scoreExtraversion = 0,
        scoreHonestyHumility = 0,
        scoreIndependence = 0,
        scoreOpenness = 0;
      for (let i = 0; i < groupTrait.Agreeableness.length; i++)
        scoreAgreeableness += groupTrait.Agreeableness[i].score;

      for (let i = 0; i < groupTrait.Conscientiousness.length; i++)
        scoreConscientiousness += groupTrait.Conscientiousness[i].score;

      for (let i = 0; i < groupTrait.Emotionality.length; i++)
        scoreEmotionality += groupTrait.Emotionality[i].score;

      for (let i = 0; i < groupTrait.Extraversion.length; i++)
        scoreExtraversion += groupTrait.Extraversion[i].score;

      for (let i = 0; i < groupTrait.HonestyHumility.length; i++)
        scoreHonestyHumility += groupTrait.HonestyHumility[i].score;

      for (let i = 0; i < groupTrait.Independence.length; i++)
        scoreIndependence += groupTrait.Independence[i].score;

      for (let i = 0; i < groupTrait.Openness.length; i++)
        scoreOpenness += groupTrait.Openness[i].score;

      let val = Math.max(
        scoreAgreeableness,
        scoreConscientiousness,
        scoreEmotionality,
        scoreExtraversion,
        scoreHonestyHumility,
        scoreIndependence,
        scoreOpenness
      );

      let profile;
      switch (val) {
        case scoreAgreeableness:
          profile = "Agreeableness";
          break;
        case scoreConscientiousness:
          profile = "Conscientiousness";
          break;
        case scoreEmotionality:
          profile = "Emotionality";
          break;
        case scoreExtraversion:
          profile = "Extraversion";
          break;
        case scoreHonestyHumility:
          profile = "HonestyHumility";
          break;
        case scoreIndependence:
          profile = "Independence";
          break;
        case scoreOpenness:
          profile = "Openness";
          break;
        default:
          break;
      }

      let insData = {
        name: this.props.location.state.token,
        trait: profile,
        answer_date: new Date(),
        user_id: this.state.user_id,
        LinkedItemsToAdd: [`Personality Profiles/${this.state.personality_id}`],
      };

      await axios({
        method: "POST",
        url: `https://dev.rapidplatform.com.au/api/rapidplatform/personalitytrait/lists/ProfileUsers/All/items`,
        data: JSON.stringify(insData),
        headers: {
          Authorization: "Bearer " + this.props.location.state.name,
          "Content-Type": "application/json",
        },
      });

      alert("Your profile matches with.. " + profile);

      try {
        this.setState({ pause2: false });
        window.location.reload(false);
        ToastsStore.success("Thank you for the feedback");
      } catch (e) {
        console.log(e);
      }
    } else {
      ToastsStore.error("You need to  answer  all the questions");
      alert("Give answer to all the questions");
    }
  };

  render() {
    if (this.state.personality_existence) {
      return <p className="titleCen">Personality Profile is not found.</p>;
    }
    if (this.state.pause) {
      return (
        <Overlay>
          <Spinner size={SpinnerSize.large} className="spinner" />
        </Overlay>
      );
    }
    if (!this.props.location.state) {
      return (
        <div>
          Login
          <Redirect to="/" />
        </div>
      );
    }
    if (!Array.isArray(this.state.questions)) {
      return <p className="titleCen">Already Given answers for this week</p>;
    }
    return (
      <div className="App">
        <ToastsContainer store={ToastsStore} lightBackground />
        <div className="testbox">
          <form method="POST" onSubmit={this.handleSubmit}>
            <h1>Personality Test</h1>
            <p>* Give honest answers</p>

            <table id="formTable">
              <tbody id="tableData"></tbody>
              <tbody>{this.renderTableData()}</tbody>
            </table>
            {this.state.pause2 ? (
              <Spinner size={SpinnerSize.large} />
            ) : (
              <div className="btn-block">
                <button type="submit" href="/">
                  Submit
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }
}

export default Form;
