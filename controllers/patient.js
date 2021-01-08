// Cargamos los modelos para usarlos posteriormente
const Patient = require('../models/patient');


//Arrancar la BBDD
const mongoose = require('mongoose');
mongoose.connect('mongodb://10.1.2.50:27017/bio_bbdd', {useNewUrlParser: true});

//Informacion de si la conexion es exitosa
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});




//Busca en la BBDD todos los pacientes existentes en la coleccion "Paciente"
//@param ninguno
//@return array de objetos de pacientes
exports.list = async function() {
	let result = await Patient.find();
	console.log(result);
	return result;
}


//Busca en la coleccion Paciente el paciente cuyo id corresponde con el de patientId
//@param parientId: id del paciente a buscar
//@return objeto con todos los atributos de un paciente
exports.read = async function(patientId) {
	let result = await Patient.find({_id: patientId});
	console.log(result);
	return result[0];
}


//Crea un nuevo paciente en la coleccion Pacinte de Mongo
//@param body: objeto que contiene los datos rellenados a través de la web
//@return el nuevo objeto paciente creado
exports.create = async function(body) {
	const newPatient = new Patient({_id: body._id, name: body.name, surname: body.surname, dni: body.dni, city:body.city, profession: body.profession, medicalHistory: body.medicalHistory});
	//let patient = new Patient(body);
	console.log(newPatient);
	let result = await newPatient.save();
	return result;
}




//Actualiza los datos del paciente en la base de datos
//@param patientId: id del paciente a actualizar
//@param body: objeto que contiene los datos rellenados a traves de la web
//@return el objeto paciente con los datos actualizados
exports.update = async function(patientId, body) {
	const filter = { _id: patientId};
	const updatePatient = {name: body.name, surname: body.surname, dni: body.dni, city:body.city};
	//new=True es para devolver el objeto actualizado
	let result = await Patient.findOneAndUpdate(filter, updatePatient, { new: true });
	console.log(result);
	return result;
}



//Elimina un paciente de la base de datos
//@param patientId: id del paciente a eliminar
//@return el resultado de la operacion de borrado
exports.delete = async function(patientId) {
	let result = await Patient.deleteOne({_id: patientId});
	console.log(result);
	return result;
}


//Obtiene todos los pacientes de la base de datos de Mongo en base a su ciudad de origen
//@param: patientId string del nombre de la ciudad
//@return: array de objetos de pacientes
exports.filterPatientsByCity = async function (city) {
	let result = await Patient.find({ city: city});
	console.log(result);
	return result;
}


//Obtiene todos los pacientes de la base de datos de MOngo en base a sus diagnosticos
//@param: diagnosis string que representa el diagnostico de un paciente
//@return: un array de objetos de pacientes
exports.filterPatientsByDiagnosis = async function (diagnosis) {
	let result = await Patient.find({ 'medicalHistory.diagnosis': diagnosis});
	console.log(result);
	return result;
}




//Obtiene todos los pacientes de la base de datos de Mongo en base al especialista y que la consulta se hiciese dentro de un rango de fechas
//@param specialist: string con el especialista medico
//@param sdate: fecha de inicio de la busqueda de consultas
//@param fdate: fecha de final de la busqueda de consultas
//@return: array de objetos de pacientes
exports.filterPatientsBySpeacialistAndDate = async function (specialist, sDate,fDate) {

    //let result = await Patient.find({ 'medicalHistory.specialist': specialist, {$and: [{'medicalHistory.date':{$gte: sdate}},{'medicalHistory.date':{$lte: fdate}}]}});
    //let result = await Patient.find({ 'medicalHistory.specialist': specialist, 'medicalHistory.date':{$gte: sDate}, 'medicalHistory.date':{$lte: fDate}});
    //let result = await Patient.find({ 'medicalHistory.specialist': specialist, 'medicalHistory.date': {$and: [$gte: sDate,$lte: fDate]}});
    //let result = await Patient.find({$and: [{'medicalHistory.specialist': specialist},{'medicalHistory.date':{$gte: sDate}},{'medicalHistory.date':{$lte: fDate}}]});
	//let result = await Patient.find({ 'medicalHistory.specialist': specialist}).find({'medicalHistory.date':{$gte: sDate}}).find({'medicalHistory.date':{$lte: fDate}});
	

	let result = Patient.aggregate([
		{ $unwind: '$medicalHistory'},
		{ $match: { 'medicalHistory.specialist': specialist} },
		{ $match: { 'medicalHistory.date':{$gte: new Date(sDate)}} },
		{ $match: { 'medicalHistory.date':{$lte: new Date(fDate)}} }
	]);


	/*

	let result = []

	let resultSpecialist = await Patient.find({ 'medicalHistory.specialist': specialist });
	console.log(resultSpecialist);

	resultSpecialist.forEach(resultado => {
		resultado.medicalHistory.forEach(historia => {
			if (historia.specialist == specialist) {
				if (historia.date.getTime() >= sDate.getTime()) {
					if (historia.date.getTime() <= fDate.getTime()) {
						result.push(resultado)
				}
			}
		} else {
			console.log("Especialista erroneo");
			console.log(historia.specialist);
			console.log(specialist);
		}
		});
	});
	*/
	

	console.log(result);
	return result;
}


//Añade una nueva consulta al historial medico del paciente representado por patientId
//@param patientId: id del paciente al que se le añade una nueva consulta al historial
//@param medicalRecord: objeto con los datos de la consulta
//@return el objeto paciente con los datos actualizados incluido la nueva consulta
exports.addPatientHistory = async function (patientId, medicalRecord) {
	const filter = { _id: patientId};
	let patientsArray = await Patient.find({_id: patientId});
	let searchPatient = patientsArray[0];
	let _medicalHistory = searchPatient.medicalHistory;
	_medicalHistory.push(medicalRecord);
	const updatePatient = {medicalHistory: _medicalHistory};
	let result = await Patient.findOneAndUpdate(filter, updatePatient, { new: true });
	console.log(result);
	return result;
}