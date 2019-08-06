import React, { Component } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import {  View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Card, CardItem, Body,  Header, Icon, Item, Input, Label } from 'native-base';
import Dialog from "react-native-dialog";
import axios from 'axios';
import api from '../services/api';
import io from 'socket.io-client';

export default class Feed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            feed: [],
            open: false,
			acao:false,
			quantidade: '',
			postId: null,
			busca:''
        };
    }

    static navigationOptions = ({ navigation }) => ({
        headerRight:(
    <TouchableOpacity style={{marginHorizontal: 20}} onPress={() => navigation.navigate('New')}>
    </TouchableOpacity> 
        ),
    });

    async componentDidMount(){
        this.registerToSocket();

        const response = await api.get('/produtos');
        this.setState({ feed: response.data });
    }
    registerToSocket = () =>{
        const socket = io('http://10.0.3.2:3333');

        socket.on('post', newPost =>{
            this.setState({feed: [newPost, ...this.state.feed]});
		});

		socket.on('adicionado', addPost =>{
            this.setState({
                feed: this.state.feed.map( post =>
                    post._id == addPost._id ? addPost : post
            ) 
			});
		});
		
		socket.on('removido', addPost =>{
            this.setState({
                feed: this.state.feed.map( post =>
                    post._id == addPost._id ? addPost : post
            ) 
			});
			
        });
    }

	addProduto = id => {
		this.setState({ open: false, postId:id });
		var bodyFormData = new FormData();
		bodyFormData.append('quantidade', this.state.quantidade);
		console.log(bodyFormData);
		axios({
			method: 'post',
			url: `http://10.0.3.2:3333/atualizaEstoque/${id}/addProduto`,
			data: bodyFormData,
			config: { headers: {'Content-Type': 'multipart/form-data' }}
			});
	}

	removeProduto = id => {
		this.setState({ open: false, postId:id });
		var bodyFormData = new FormData();
		bodyFormData.append('quantidade', this.state.quantidade);
		axios({
			method: 'post',
			url: `http://10.0.3.2:3333/atualizaEstoque/${id}/subProduto`,
			data: bodyFormData,
			config: { headers: {'Content-Type': 'multipart/form-data' }}
			});
	}
	
	processaData(data){
		var now = new Date(data);
		var date = now.toLocaleDateString('en-GB');
		var time = now.toLocaleTimeString();
		return time+"  "+date;
	}
	handleCancel = () => {
		this.setState({ open: false });
	  };

    render() {
        let novoFeed = this.state.feed.filter(
			(post) => {
				return post.nome.indexOf(this.state.busca) !== -1;
			}
		);
		console.log(this.setState.busca);
		let dialogtext;
		let button;
		if(this.state.acao){
			dialogtext =   <Dialog.Description style={{marginTop: 20}}>
				Insira a quantidade que deseja adicionar
			</Dialog.Description>;

			button = <Dialog.Button bordered onPress={() => this.addProduto(this.state.postId)} label="Adicionar">
			</Dialog.Button>;
		}
		else{
			dialogtext =   <Dialog.Description style={{marginTop: 20}}>
				Insira a quantidade que deseja remover
			</Dialog.Description>;

			button = <Dialog.Button onPress={() => this.removeProduto(this.state.postId)} label="Remover">
			</Dialog.Button>;
		}


        return (
            <View style={styles.container}>
				<Header searchBar rounded>
					<Item>
						<Icon name="ios-search" />
						<Input onChangeText={textoBusca => this.setState({ busca: textoBusca })} placeholder="Procurar..." />
					</Item>
					<Button transparent>
						<Text>Procurar...</Text>
					</Button>
				</Header>
			<View>
					<Dialog.Container visible={this.state.open}>
					<Dialog.Title>Insira a quantidade</Dialog.Title>
						{dialogtext}
					{/* <Dialog.Input label="Quantidade" onChangeText={quantidade => this.setState({quantidade})}></Dialog.Input>
					 */}
					 <Item floatingLabel>
						<Label style={{color:'#3E5BAF'}}>Quantidade</Label>
						<Input onChangeText={quantidade => this.setState({quantidade})}/>
					</Item>
					<Dialog.Button label="Cancelar" onPress={this.handleCancel} />
					{button}
					</Dialog.Container>
				</View>
            <FlatList
				data={novoFeed}
                keyExtractor={post => post._id}
                renderItem={({item})=> (
                    <Card bordered style={styles.card}>
						<CardItem header style={styles.CardItem}>
							<Text style={styles.headerTitulo} >{item.nome}</Text> 
							<Text style={styles.headerInfo} >{item.quantidade} - {item.unidade}</Text> 
						</CardItem>
						<CardItem style={styles.CardItem}> 
							<Body style={{ marginTop: -10,}}>
								<Text style={styles.textoBody}>Última Alteração: {this.processaData(item.updatedAt) }</Text>
							</Body>
						</CardItem>
						<CardItem footer style={styles.CardItem}>
							<View footer style={styles.actions}>
								<Button block onPress={() =>this.setState({ open: true, acao:true, postId: item._id  })}>
									<Text> Adicionar </Text>
								</Button>
								<Button danger onPress={() =>this.setState({ open: true, acao:false, postId: item._id  })}>
									<Text> Remover </Text>
								</Button>
							</View>
						</CardItem>
                 </Card>
                )}
                />
        </View>
        ); 
      }
    }
    
    const styles = StyleSheet.create({
        container:{
			flex: 1,
			justifyContent: 'center',
			backgroundColor: "#DDDDDD",
		},
		card:{
			marginRight: 20,
			marginLeft: 25,
			marginBottom: 10,
			borderRadius: 25,
		},
		CardItem:{
			borderRadius: 25,
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'space-between',
		},
		headerTitulo:{
			fontSize: 20,
			fontWeight: 'bold',
		},
		headerInfo:{
			fontSize: 20,
		},
		textoBody:{
			fontSize: 18,
		},
		actions:{
			flex: 1,
			flexDirection: 'row-reverse',
			justifyContent: 'space-evenly',
		},
    });
    