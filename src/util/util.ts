// 오늘 날짜 반환
export function getToday() {
    const year = new Date().getUTCFullYear()
    const month = `0${new Date().getUTCMonth()+1}`.slice(-2)
    const day = `0${new Date().getUTCDate()}`.slice(-2)
    
    return `${ year }-${ month }-${( day )}`
  }