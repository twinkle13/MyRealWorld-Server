module.exports = {
parseStringIntoArray: function (StringData)
{
return StringData.split('~');
},
parseArrayIntoString : function (ArrayData)
{
var str=ArrayData[0];
for(let i=1;i<ArrayData.length;i++)
{
str=str+'~'+ArrayData[i];
}
return str;
}
}