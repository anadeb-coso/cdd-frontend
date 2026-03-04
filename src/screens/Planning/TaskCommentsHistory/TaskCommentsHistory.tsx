import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import moment from 'moment';
import Content from './containers/Content';
import { styles } from './TaskCommentsHistory.styles';
import { updateDocument } from '../../../utils/coucdb_call';
import CommentsAPI from '../../../services/planning/comments';
moment.locale('fr');

function TaskCommentsHistory(
  { taskPlanned, selectedDate, comments, setComments, commentsRead, onRefresh }: 
  { taskPlanned: any, selectedDate: any, comments: any, setComments: (i: any) => void, commentsRead: boolean, onRefresh: () => void }
) {
  const customStyles = styles();
  
  const comment_read = async () => {
    // if ([undefined, false].includes(commentsRead)) {
    if(commentsRead){
      try {
        
          let _comments = comments.map((elt: any) => {
            return {
              ...elt,
              activity: taskPlanned?.id ?? (elt?.activity?.id ?? elt?.activity),
              user: elt?.user?.id ?? elt?.user,
              facilitator: elt?.facilitator?.id ?? elt?.facilitator,
              comment_read: true
            }
          });
          // console.log(_comments)
          setComments(_comments)
        await new CommentsAPI().save_comments(
          _comments
        ).then(function (res: any) {

            onRefresh();
            
          }).catch(function (err: any) {
          });

      } catch (e) {

      }
    }
  };


  useEffect(() => {
    comment_read();
  }, []);

  
  return (
    <SafeAreaView style={customStyles.container}>
      <Content comments={comments} />
    </SafeAreaView>
  );
}

export default TaskCommentsHistory;
