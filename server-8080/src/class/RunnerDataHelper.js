//  This is a Constructor function taking age and name
//  as the paramaters
function RunnerDataHelper () {
}
// Sets the age
// 
// RunnerDataHelper.prototype.setDob = function (dob) {
//   this.dob = dob
// }
// gets runner current age
RunnerDataHelper.getAge = function (dob) {
  let dateDob = new Date(dob)
  var milliseconds = new Date().getTime() - dateDob.getTime()
  var y = Math.floor(milliseconds / 1000 / 3600 / 24 / 365)
  return y
}

const ageGroupTable = [
  {'age_min': 18, 'age_max': 34, 'name': '18-34'},
  {'age_min': 35, 'age_max': 39, 'name': '35-39'},
  {'age_min': 40, 'age_max': 44, 'name': '40-44'},
  {'age_min': 45, 'age_max': 49, 'name': '45-49'},
  {'age_min': 50, 'age_max': 54, 'name': '50-54'},
  {'age_min': 55, 'age_max': 59, 'name': '55-59'},
  {'age_min': 60, 'age_max': 64, 'name': '60-64'},
  {'age_min': 65, 'age_max': 69, 'name': '65-69'},
  {'age_min': 70, 'age_max': 74, 'name': '70-74'},
  {'age_min': 75, 'age_max': 79, 'name': '75-79'},
  {'age_min': 80, 'age_max': 10, 'name': '80andover'}]

// gets runner current age group
RunnerDataHelper.getAgeGroup = function (dob) {
  const y = RunnerDataHelper.getAge(dob)
  let ret = ''
  ageGroupTable.every(function (element) {
    if (element.age_min <= y && element.age_max >= y) {
      ret = element.name
      // console.log(ret +" is the Q time!");
      return false// break
    }
    return true
  })
  return ret
}
//  Sets the RunnerData object to module.exports
// 
const nextBqQualificationDate = new Date('2021-04-21')
const nextBqQualificationTable = [
  {'age_min': 18, 'age_max': 34, 'time4male': '30000', 'time4female': '33000'},
  {'age_min': 35, 'age_max': 39, 'time4male': '30500', 'time4female': '33500'},
  {'age_min': 40, 'age_max': 44, 'time4male': '31000', 'time4female': '34000'},
  {'age_min': 45, 'age_max': 49, 'time4male': '32000', 'time4female': '35000'},
  {'age_min': 50, 'age_max': 54, 'time4male': '32500', 'time4female': '35500'},
  {'age_min': 55, 'age_max': 59, 'time4male': '33500', 'time4female': '40500'},
  {'age_min': 60, 'age_max': 64, 'time4male': '35000', 'time4female': '42000'},
  {'age_min': 65, 'age_max': 69, 'time4male': '40500', 'time4female': '43500'},
  {'age_min': 70, 'age_max': 74, 'time4male': '42000', 'time4female': '45000'},
  {'age_min': 75, 'age_max': 79, 'time4male': '43500', 'time4female': '50500'},
  {'age_min': 80, 'age_max': 10, 'time4male': '45000', 'time4female': '52000'}]
RunnerDataHelper.getNextBqDate = function () {
  return nextBqQualificationDate.toISOString().slice(0, 10)
}
RunnerDataHelper.getNextBqTime = function (dob, gender) {
  const milliseconds = nextBqQualificationDate.getTime() - new Date(dob).getTime()
  const y = Math.floor(milliseconds / 1000 / 3600 / 24 / 365)
  // console.log(y, ' years old!')
  let ret = ''
  nextBqQualificationTable.every(function (element) {
    if (element.age_min <= y && element.age_max >= y) {
      if (gender === 'F') { ret = element.time4female }
      if (gender === 'M') { ret = element.time4male }
      // console.log(ret, ' is the Q time!')
      return false// break
    }
    return true
  })
  return RunnerDataHelper.format_Q_time(ret)
}
RunnerDataHelper.format_Q_time = function (s) {
  if (!s || s.length < 5) return 'N/A'
  return s.charAt(0) + ':' + s.charAt(1) + s.charAt(2) + ':' + s.charAt(3) + s.charAt(4)
}
// expect distance: 10K, 21.1K, 30K etc.
// expect time:00:33:22, 01:33:00 etc.
RunnerDataHelper.calPace = function (distance, time) {
  const distanceRegex = /^\d+(\.\d{1})?K$/
  if (!distance || !distance.match(distanceRegex)) {
    return 'invalid data'
  }
  let s = RunnerDataHelper.convertHMSTOSec(time)
  if (s === 0) {
    return 'invalid data'
  }
  s = s / parseFloat(distance)
  return RunnerDataHelper.convertSecToHMS(s)
}
RunnerDataHelper.convertHMSTOSec = function (time) {
  const regex = /^[0]?([0-9]:)?[0-5][0-9]:[0-5][0-9]$/g

  if (!time || !time.match(regex)) {
    console.log('invalid time format:', time)
    return 0
  }
  let sec = 0
  time.split(':').forEach(function (item, index) {
    sec = sec * 60 + parseInt(item)
  })
  return sec
}
// expect sec is a number
// return 00:12:00
RunnerDataHelper.convertSecToHMS = function (sec) {
  if (!sec || sec === 0) {
    return ''
  }
  let measuredTime = new Date(null)
  measuredTime.setSeconds(sec) // specify value of SECONDS
  if (sec <= 600) {
    return measuredTime.toISOString().substr(14, 5)
  } else {
    return measuredTime.toISOString().substr(11, 8)
  }
}
module.exports = RunnerDataHelper
