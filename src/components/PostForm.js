import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { addNewPost } from '../store/postSlice';

const PostForm = () => {
  const [text, setText] = useState('');
  const dispatch = useDispatch();

  const submit = () => {
    if (!text.trim()) return;
    dispatch(addNewPost({ content: text.trim() }))
      .unwrap()
      .then(() => setText(''))
      .catch(err => console.log(err));
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
        style={styles.input}
        multiline
      />
      <TouchableOpacity onPress={submit} style={styles.button}>
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, minHeight: 60 },
  button: { marginTop: 10, backgroundColor: '#1E90FF', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default PostForm;
