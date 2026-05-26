import React from "react";
import { styles } from "./styles";
import { FlatList, View } from "react-native";

interface ListProps {
  data: any[];
  onLoadMore: () => void;
  renderItemContent: (item: any) => React.ReactNode;
  listStyle?: object;
}

export function List({ data, onLoadMore, renderItemContent, listStyle }: ListProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <View>{renderItemContent(item)}</View>}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.2}
      contentContainerStyle={[styles.container, listStyle]}
      style={{ flex: 1 }}
    />
  );
}
