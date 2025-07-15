// utils/socket.js
import { io } from 'socket.io-client';
import API_URL from './constans'

const socket = io(API_URL); // Adjust the URL for your backend

export default socket;
