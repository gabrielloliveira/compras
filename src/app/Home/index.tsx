import { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  FlatList,
  Alert,
} from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Filter } from "@/components/Filter";
import { Item } from "@/components/Item";
import { FilterStatus } from "@/types/FilterStatus";
import { itemsStorage, ItemStorage } from "@/storage/itemsStorage";
import { styles } from "./styles";

const FILTER_STATUS: FilterStatus[] = [FilterStatus.PENDING, FilterStatus.DONE];

export function Home() {
  const [filterActiveRender, setFilterActiveRender] = useState(
    FilterStatus.PENDING
  );
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ItemStorage[]>([]);

  async function handleAddItem() {
    if (!description.trim()) {
      return Alert.alert("Adicionar", "Informe a descrição para adicionar");
    }
    const newItem = {
      id: Math.random().toString(36).substring(2),
      description: description,
      status: FilterStatus.PENDING,
    };

    await itemsStorage.add(newItem);
    Alert.alert("Adicionado!", `Adicionado ${description}`);
    setDescription("");
    if (filterActiveRender === FilterStatus.PENDING) {
      await getItemsByStatus();
    } else {
      setFilterActiveRender(FilterStatus.PENDING);
    }
  }

  async function getItemsByStatus() {
    try {
      const response = await itemsStorage.getByStatus(filterActiveRender);
      setItems(response);
    } catch (error) {
      console.log(error);
      return Alert.alert(
        "Erro",
        "Não foi possível buscar os items cadastrados"
      );
    }
  }

  async function handleRemoveItem(id: string) {
    try {
      await itemsStorage.remove(id);
      await getItemsByStatus();
    } catch (error) {
      console.log(error);
      return Alert.alert(
        "Erro!",
        "Não foi possível remover o item da lista de compras."
      );
    }
  }

  function handleClear() {
    Alert.alert("Limpar", "Deseja remover todos?", [
      { text: "Não", style: "cancel" },
      { text: "Sim", style: "default", onPress: () => onClear() },
    ]);
  }

  async function onClear() {
    try {
      await itemsStorage.clear();
      setItems([]);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível limpar a lista de compras.");
    }
  }

  async function handleToggleItemStatus(id: string) {
    try {
      await itemsStorage.toggleStatus(id);
      await getItemsByStatus();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível atualizar o status do item");
    }
  }

  useEffect(() => {
    getItemsByStatus();
  }, [filterActiveRender]);

  return (
    <>
      <View style={styles.container}>
        <Image source={require("@/assets/logo.png")} style={styles.logo} />

        <View style={styles.form}>
          <Input
            placeholder="O que você precisa comprar?"
            onChangeText={setDescription}
            value={description}
          />
          <Button title="Adicionar" onPress={handleAddItem} />
        </View>

        <View style={styles.content}>
          <View style={styles.contentHeader}>
            {FILTER_STATUS.map((status) => (
              <Filter
                key={status}
                status={status}
                isActive={status === filterActiveRender}
                onPress={() => setFilterActiveRender(status)}
              />
            ))}
            <TouchableOpacity
              style={styles.contentClearButton}
              onPress={handleClear}
            >
              <Text style={styles.contentClearText}>Limpar</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Item
                onStatus={() => handleToggleItemStatus(item.id)}
                onRemove={() => handleRemoveItem(item.id)}
                data={item}
              />
            )}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={styles.contentItemSeparator} />
            )}
            contentContainerStyle={styles.contentList}
            ListEmptyComponent={() => (
              <Text style={styles.containerListEmptyText}>
                Nenhum item aqui
              </Text>
            )}
          />
        </View>
      </View>
    </>
  );
}
