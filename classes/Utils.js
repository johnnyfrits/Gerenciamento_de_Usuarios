class Utils {

    static dateFormat(date) {

        return String("00" + date.getDate()).slice(-2) + '/' + String("00" + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear() +
            ' ' + String("00" + date.getHours()).slice(-2) + ':' + String("00" + date.getMinutes()).slice(-2);
    }
}